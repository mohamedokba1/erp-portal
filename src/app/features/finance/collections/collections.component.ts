import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { FinanceDataService } from '../../../core/data/finance-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CollectionActivity, CollectionActivityType, Invoice } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule, TranslatePipe],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit {
  queue: Invoice[] = [];
  activityTypes: CollectionActivityType[] = ['اتصال هاتفي', 'بريد إلكتروني', 'زيارة ميدانية', 'وعد بالسداد'];

  showFollowUp = false;
  selected: Invoice | null = null;
  activities: CollectionActivity[] = [];

  form = {
    type: 'اتصال هاتفي' as CollectionActivityType,
    notes: '',
    isPromise: false,
    promiseDate: '',
    promiseAmount: 0,
  };

  constructor(private finance: FinanceDataService, public auth: AuthService, private toast: MessageService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    this.queue = this.finance.getOverdueQueue();
  }

  totalOverdue(): number {
    return this.queue.reduce((s, inv) => s + this.finance.invoiceRemaining(inv), 0);
  }

  get openPromisesCount(): number {
    return this.finance.getOpenPromisesCount();
  }

  daysOverdue = (inv: Invoice) => this.finance.daysOverdue(inv);
  remaining = (inv: Invoice) => this.finance.invoiceRemaining(inv);

  lastActivity(inv: Invoice) {
    return this.finance.getLastCollectionActivity(inv.id);
  }

  severityClass(days: number): string {
    if (days > 90) return 'danger';
    if (days > 30) return 'warning';
    return 'info';
  }

  openFollowUp(inv: Invoice): void {
    this.selected = inv;
    this.activities = this.finance.getCollectionActivitiesForInvoice(inv.id);
    this.form = { type: 'اتصال هاتفي', notes: '', isPromise: false, promiseDate: '', promiseAmount: this.remaining(inv) };
    this.showFollowUp = true;
  }

  closeFollowUp(): void {
    this.showFollowUp = false;
    this.selected = null;
  }

  get isFormValid(): boolean {
    return this.form.notes.trim().length > 0;
  }

  saveActivity(): void {
    if (!this.selected || !this.isFormValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى كتابة ملاحظات للمتابعة.'), life: 3500 });
      return;
    }
    this.finance.logCollectionActivity(this.selected.id, {
      date: '2026-08-24',
      type: this.form.type,
      notes: this.form.notes,
      promiseDate: this.form.isPromise ? this.form.promiseDate : undefined,
      promiseAmount: this.form.isPromise ? this.form.promiseAmount : undefined,
      recordedBy: this.auth.currentUser()?.name ?? '—',
    });
    this.activities = this.finance.getCollectionActivitiesForInvoice(this.selected.id);
    this.form = { type: 'اتصال هاتفي', notes: '', isPromise: false, promiseDate: '', promiseAmount: this.remaining(this.selected) };
    this.toast.add({ severity: 'success', summary: this.lang.t('تم تسجيل المتابعة'), detail: `${this.selected.invoiceNumber} — ${this.selected.customerName}`, life: 3000 });
  }

  deleteActivity(activity: CollectionActivity): void {
    this.finance.deleteCollectionActivity(activity.id);
    if (this.selected) {
      this.activities = this.finance.getCollectionActivitiesForInvoice(this.selected.id);
    }
    this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), life: 2000 });
  }
}
