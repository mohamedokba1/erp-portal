import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { FinanceDataService } from '../../../core/data/finance-data.service';
import { KpiCard, AgingBucket, MonthlyFinancePoint, Invoice, ClientFinanceSummary } from '../../../core/models/models';
import { KpiCardComponent } from '../../../shared/kpi-card/kpi-card.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

Chart.register(...registerables);

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, TranslatePipe],
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.scss',
})
export class FinanceDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('financeChart') chartRef!: ElementRef<HTMLCanvasElement>;

  kpis: KpiCard[] = [];
  aging: AgingBucket[] = [];
  monthly: MonthlyFinancePoint[] = [];
  recentInvoices: Invoice[] = [];
  topOverdueClients: ClientFinanceSummary[] = [];

  constructor(private finance: FinanceDataService, public lang: LanguageService) {}

  avgPaymentLabel(days: number): string {
    return this.lang.isEn() ? `avg. ${days} days to pay` : `متوسط ${days} يوم سداد`;
  }

  ngOnInit(): void {
    this.kpis = this.finance.getFinanceKpis();
    this.aging = this.finance.getAgingBuckets();
    this.monthly = this.finance.getMonthlyFinance();
    this.recentInvoices = this.finance.getInvoices()
      .slice()
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 5);
    this.topOverdueClients = this.finance.getClientFinanceSummaries()
      .filter(c => c.overdueAmount > 0)
      .sort((a, b) => b.overdueAmount - a.overdueAmount)
      .slice(0, 5);
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  remaining(inv: Invoice): number {
    return this.finance.invoiceRemaining(inv);
  }

  total(inv: Invoice): number {
    return this.finance.invoiceTotal(inv);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      'مسودة': 'neutral',
      'مرسلة': 'info',
      'مدفوعة جزئياً': 'warning',
      'مدفوعة بالكامل': 'success',
      'متأخرة': 'danger',
      'ملغاة': 'neutral',
    };
    return map[status] ?? 'neutral';
  }

  maxAging(): number {
    return Math.max(...this.aging.map(a => a.amount), 1);
  }

  agingSeverity(index: number): string {
    return ['success', 'warning', 'warning', 'danger'][index] ?? 'neutral';
  }

  private renderChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthly.map(m => this.lang.t(m.month)),
        datasets: [
          {
            label: this.lang.t('قيمة الفواتير الصادرة'),
            data: this.monthly.map(m => m.invoiced),
            backgroundColor: 'rgba(44, 95, 138, 0.75)',
            borderRadius: 5,
            barPercentage: 0.6,
          },
          {
            label: this.lang.t('المحصّل فعلياً'),
            data: this.monthly.map(m => m.collected),
            backgroundColor: 'rgba(27, 138, 90, 0.75)',
            borderRadius: 5,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 7,
              boxHeight: 7,
              font: { family: 'Inter', size: 12, weight: 500 },
              color: '#4a5568',
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: '#0f2a4a',
            titleFont: { family: 'Inter', size: 12, weight: 700 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${item.formattedValue}M ${this.lang.t('ج.م')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11.5 }, color: '#6b7789' },
          },
          y: {
            grid: { color: '#eef1f5' },
            ticks: {
              font: { family: 'Inter', size: 11.5 },
              color: '#6b7789',
              callback: (v) => v + 'M',
            },
          },
        },
      },
    });
  }
}
