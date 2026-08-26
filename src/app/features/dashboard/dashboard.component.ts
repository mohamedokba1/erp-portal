import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { MockDataService } from '../../core/data/mock-data.service';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { KpiCard, RepPerformance, FollowUpAlert, MonthlySalesPoint, Quote } from '../../core/models/models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/i18n/language.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;

  kpis: KpiCard[] = [];
  reps: RepPerformance[] = [];
  alerts: FollowUpAlert[] = [];
  monthlySales: MonthlySalesPoint[] = [];
  recentQuotes: Quote[] = [];

  constructor(private data: MockDataService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.kpis = this.data.getKpis();
    this.reps = this.data.getRepPerformance().sort((a, b) => (b.achieved / b.target) - (a.achieved / a.target));
    this.alerts = this.data.getFollowUpAlerts();
    this.monthlySales = this.data.getMonthlySales();
    this.recentQuotes = this.data.getAllQuotes()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  repProgress(rep: RepPerformance): number {
    return Math.min(100, Math.round((rep.achieved / rep.target) * 100));
  }

  severityColor(sev: string): string {
    return sev === 'high' ? 'danger' : sev === 'medium' ? 'warning' : 'info';
  }

  quoteStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'مسودة': 'neutral',
      'بانتظار الاعتماد': 'warning',
      'معتمد': 'success',
      'مرسل للعميل': 'info',
      'مرفوض': 'danger',
      'محوّل لأمر بيع': 'success',
    };
    return map[status] ?? 'neutral';
  }

  private renderChart(): void {
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(44, 95, 138, 0.22)');
    gradient.addColorStop(1, 'rgba(44, 95, 138, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlySales.map(m => this.lang.t(m.month)),
        datasets: [
          {
            label: this.lang.t('المبيعات الفعلية'),
            data: this.monthlySales.map(m => m.actual),
            borderColor: '#2C5F8A',
            backgroundColor: gradient,
            borderWidth: 2.5,
            pointRadius: 3.5,
            pointBackgroundColor: '#2C5F8A',
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            fill: true,
            tension: 0.35,
          },
          {
            label: this.lang.t('المستهدف'),
            data: this.monthlySales.map(m => m.target),
            borderColor: '#cbd3de',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.35,
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
