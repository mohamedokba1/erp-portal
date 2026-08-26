import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FinanceDataService } from '../../../core/data/finance-data.service';
import { ClientFinanceSummary, Invoice, PaymentBehavior, InvoiceStatus } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-client-status',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, TranslatePipe],
  templateUrl: './client-status.component.html',
  styleUrl: './client-status.component.scss',
})
export class ClientStatusComponent implements OnInit {
  clients: ClientFinanceSummary[] = [];
  searchTerm = '';
  behaviorFilter: PaymentBehavior | 'الكل' = 'الكل';
  behaviorOptions: (PaymentBehavior | 'الكل')[] = ['الكل', 'ملتزم', 'متأخر أحياناً', 'متعثر'];

  showDetail = false;
  selectedClient: ClientFinanceSummary | null = null;
  selectedInvoices: Invoice[] = [];

  constructor(private finance: FinanceDataService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.clients = this.finance.getClientFinanceSummaries()
      .sort((a, b) => b.outstanding - a.outstanding);
  }

  get filtered(): ClientFinanceSummary[] {
    return this.clients.filter(c => {
      const matchesSearch =
        !this.searchTerm ||
        c.customerName.includes(this.searchTerm) ||
        c.customerCode.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBehavior = this.behaviorFilter === 'الكل' || c.paymentBehavior === this.behaviorFilter;
      return matchesSearch && matchesBehavior;
    });
  }

  creditUsagePercent(c: ClientFinanceSummary): number {
    if (!c.creditLimit) return 0;
    return Math.min(150, Math.round((c.outstanding / c.creditLimit) * 100));
  }

  creditStatus(c: ClientFinanceSummary): 'success' | 'warning' | 'danger' {
    const pct = this.creditUsagePercent(c);
    if (pct >= 100) return 'danger';
    if (pct >= 75) return 'warning';
    return 'success';
  }

  behaviorBadge(behavior: PaymentBehavior): string {
    const map: Record<PaymentBehavior, string> = {
      'ملتزم': 'success',
      'متأخر أحياناً': 'warning',
      'متعثر': 'danger',
    };
    return map[behavior];
  }

  statusBadge(status: InvoiceStatus): string {
    const map: Record<InvoiceStatus, string> = {
      'مسودة': 'neutral',
      'مرسلة': 'info',
      'مدفوعة جزئياً': 'warning',
      'مدفوعة بالكامل': 'success',
      'متأخرة': 'danger',
      'ملغاة': 'neutral',
    };
    return map[status];
  }

  invoiceTotal = (inv: Invoice) => this.finance.invoiceTotal(inv);
  invoiceRemaining = (inv: Invoice) => this.finance.invoiceRemaining(inv);

  openDetail(client: ClientFinanceSummary): void {
    this.selectedClient = client;
    this.selectedInvoices = this.finance.getInvoicesForCustomer(client.customerId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedClient = null;
  }
}
