import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { MockDataService } from '../../../core/data/mock-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Customer, CustomerActivity, Quote, SalesOrderSummary } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DaysAgoPipe } from '../../../core/i18n/days-ago.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TabViewModule, DialogModule, DropdownModule, TranslatePipe, DaysAgoPipe],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss',
})
export class CustomerProfileComponent implements OnInit {
  customer?: Customer;
  activities: CustomerActivity[] = [];
  quotes: Quote[] = [];
  orders: SalesOrderSummary[] = [];
  repNames: string[] = [];

  showTransfer = false;
  newOwner = '';

  constructor(
    private route: ActivatedRoute,
    private data: MockDataService,
    public auth: AuthService,
    private toast: MessageService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.customer = this.data.getCustomerById(id);
    this.activities = this.data.getActivitiesForCustomer(id);
    this.quotes = this.data.getQuotesForCustomer(id);
    this.orders = this.data.getOrdersForCustomer(id);
    this.repNames = this.data.getSalesRepNames();
  }

  tierBadge(tier: string): string {
    return tier === 'استراتيجي' ? 'navy' : tier === 'رئيسي' ? 'info' : 'neutral';
  }

  statusBadge(status: string): string {
    return status === 'نشط' ? 'success' : status === 'محتمل' ? 'warning' : 'neutral';
  }

  activityIcon(type: string): string {
    const map: Record<string, string> = {
      'زيارة': 'pi-map-marker',
      'مكالمة': 'pi-phone',
      'بريد إلكتروني': 'pi-envelope',
      'اجتماع': 'pi-users',
    };
    return map[type] ?? 'pi-circle';
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

  orderStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'قيد التنفيذ': 'warning',
      'تم التسليم': 'info',
      'فاتورة صادرة': 'success',
    };
    return map[status] ?? 'neutral';
  }

  tabHeader(arKey: string, count: number): string {
    return `${this.lang.t(arKey)} (${count})`;
  }

  openTransfer(): void {
    if (!this.customer) return;
    this.newOwner = this.repNames.find(n => n !== this.customer!.owner) ?? '';
    this.showTransfer = true;
  }

  closeTransfer(): void {
    this.showTransfer = false;
  }

  confirmTransfer(): void {
    if (!this.customer || !this.newOwner || this.newOwner === this.customer.owner) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى اختيار مندوب مختلف عن المندوب الحالي.'), life: 3500 });
      return;
    }
    this.data.transferCustomerOwner(this.customer.id, this.newOwner);
    this.customer = this.data.getCustomerById(this.customer.id);
    this.showTransfer = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم نقل العميل'), detail: `${this.customer?.name} → ${this.newOwner}`, life: 3500 });
  }
}
