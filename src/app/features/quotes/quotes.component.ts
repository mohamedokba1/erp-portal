import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MockDataService } from '../../core/data/mock-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { Quote, QuoteStatus, Customer } from '../../core/models/models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/i18n/language.service';

interface DraftQuoteItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableModule, DialogModule, DropdownModule, ConfirmDialogModule, TranslatePipe],
  providers: [ConfirmationService],
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.scss',
})
export class QuotesComponent implements OnInit {
  quotes: Quote[] = [];
  customers: Customer[] = [];
  statusFilter: QuoteStatus | 'الكل' = 'الكل';
  searchTerm = '';

  statusOptions: (QuoteStatus | 'الكل')[] = [
    'الكل', 'مسودة', 'بانتظار الاعتماد', 'معتمد', 'مرسل للعميل', 'مرفوض', 'محوّل لأمر بيع',
  ];

  showCreate = false;
  newQuote = this.emptyDraft();

  showEdit = false;
  editTarget: Quote | null = null;
  editDraft = this.emptyDraft();

  constructor(
    private data: MockDataService,
    public auth: AuthService,
    private confirm: ConfirmationService,
    private toast: MessageService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.customers = this.data.getCustomers();
  }

  private refresh(): void {
    this.quotes = this.data.getAllQuotes().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get filtered(): Quote[] {
    return this.quotes.filter(q => {
      const matchesStatus = this.statusFilter === 'الكل' || q.status === this.statusFilter;
      const matchesSearch =
        !this.searchTerm ||
        q.customerName.includes(this.searchTerm) ||
        q.quoteNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  get pendingApprovalCount(): number {
    return this.quotes.filter(q => q.status === 'بانتظار الاعتماد').length;
  }

  get totalOpenValue(): number {
    return this.quotes
      .filter(q => !['مرفوض', 'محوّل لأمر بيع'].includes(q.status))
      .reduce((sum, q) => sum + q.totalValue, 0);
  }

  statusBadge(status: QuoteStatus): string {
    const map: Record<QuoteStatus, string> = {
      'مسودة': 'neutral',
      'بانتظار الاعتماد': 'warning',
      'معتمد': 'success',
      'مرسل للعميل': 'info',
      'مرفوض': 'danger',
      'محوّل لأمر بيع': 'success',
    };
    return map[status];
  }

  canApprove(quote: Quote): boolean {
    return quote.status === 'بانتظار الاعتماد' && this.auth.can('quotes.approve');
  }

  private isOwnerOrManager(quote: Quote): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'sales_manager') return true;
    return quote.createdBy === user.name;
  }

  canEditQuote(quote: Quote): boolean {
    return (quote.status === 'مسودة' || quote.status === 'مرسل للعميل') && this.isOwnerOrManager(quote);
  }

  canDeleteQuote(quote: Quote): boolean {
    return quote.status === 'مسودة' && this.isOwnerOrManager(quote);
  }

  approve(quote: Quote, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      header: this.lang.t('اعتماد عرض السعر'),
      message: `${this.lang.t('هل تريد اعتماد عرض السعر')} ${quote.quoteNumber}؟`,
      icon: 'pi pi-check-circle',
      acceptLabel: this.lang.t('نعم، اعتماد'),
      rejectLabel: this.lang.t('تراجع'),
      accept: () => {
        this.data.approveQuote(quote.id);
        this.refresh();
        this.toast.add({ severity: 'success', summary: this.lang.t('تم اعتماد العرض'), detail: `${quote.quoteNumber} — ${quote.customerName}`, life: 3000 });
      },
    });
  }

  reject(quote: Quote, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      header: this.lang.t('رفض عرض السعر'),
      message: `${this.lang.t('هل تريد رفض عرض السعر')} ${quote.quoteNumber}؟`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، رفض'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.data.rejectQuote(quote.id);
        this.refresh();
        this.toast.add({ severity: 'error', summary: this.lang.t('تم رفض العرض'), detail: `${quote.quoteNumber} — ${quote.customerName}`, life: 3000 });
      },
    });
  }

  // ---------- create dialog ----------
  private emptyDraft() {
    return {
      customerId: '',
      validUntil: '',
      discountPercent: 0,
      items: [{ productName: '', quantity: 1, unitPrice: 0, discount: 0 }] as DraftQuoteItem[],
    };
  }

  openCreate(): void {
    this.newQuote = this.emptyDraft();
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  addLineItem(): void {
    this.newQuote.items.push({ productName: '', quantity: 1, unitPrice: 0, discount: this.newQuote.discountPercent });
  }

  removeLineItem(idx: number): void {
    if (this.newQuote.items.length === 1) return;
    this.newQuote.items.splice(idx, 1);
  }

  lineTotal(item: DraftQuoteItem): number {
    return item.quantity * item.unitPrice * (1 - item.discount / 100);
  }

  get draftTotal(): number {
    return this.newQuote.items.reduce((s, i) => s + this.lineTotal(i), 0);
  }

  get isDraftValid(): boolean {
    return (
      !!this.newQuote.customerId &&
      !!this.newQuote.validUntil &&
      this.newQuote.items.every(i => i.productName.trim() && i.quantity > 0 && i.unitPrice > 0)
    );
  }

  saveQuote(): void {
    if (!this.isDraftValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى اختيار العميل وتعبئة كل بنود العرض.'), life: 3500 });
      return;
    }
    const items = this.newQuote.items.map(i => ({ ...i, discount: this.newQuote.discountPercent }));
    const created = this.data.addQuote({
      customerId: this.newQuote.customerId,
      validUntil: this.newQuote.validUntil,
      discountPercent: this.newQuote.discountPercent,
      items,
      createdBy: this.auth.currentUser()?.name ?? '—',
    });
    this.refresh();
    this.showCreate = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم إنشاء عرض السعر'), detail: `${created.quoteNumber} — ${created.customerName}`, life: 3500 });
  }

  // ---------- edit dialog ----------
  openEdit(quote: Quote, event: Event): void {
    event.stopPropagation();
    this.editTarget = quote;
    this.editDraft = {
      customerId: quote.customerId,
      validUntil: quote.validUntil,
      discountPercent: quote.discountPercent,
      items: quote.items.map(i => ({ productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount })),
    };
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editTarget = null;
  }

  addEditLineItem(): void {
    this.editDraft.items.push({ productName: '', quantity: 1, unitPrice: 0, discount: this.editDraft.discountPercent });
  }

  removeEditLineItem(idx: number): void {
    if (this.editDraft.items.length === 1) return;
    this.editDraft.items.splice(idx, 1);
  }

  editLineTotal(item: DraftQuoteItem): number {
    return item.quantity * item.unitPrice * (1 - item.discount / 100);
  }

  get editTotal(): number {
    return this.editDraft.items.reduce((s, i) => s + this.editLineTotal(i), 0);
  }

  get isEditValid(): boolean {
    return !!this.editDraft.validUntil && this.editDraft.items.every(i => i.productName.trim() && i.quantity > 0 && i.unitPrice > 0);
  }

  saveEdit(): void {
    if (!this.editTarget || !this.isEditValid) return;
    const items = this.editDraft.items.map(i => ({ ...i, discount: this.editDraft.discountPercent }));
    this.data.updateQuote(this.editTarget.id, {
      validUntil: this.editDraft.validUntil,
      discountPercent: this.editDraft.discountPercent,
      items,
    });
    this.refresh();
    this.showEdit = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم حفظ التعديلات'), detail: this.editTarget.quoteNumber, life: 3000 });
    this.editTarget = null;
  }

  // ---------- delete ----------
  confirmDelete(quote: Quote, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      header: this.lang.t('حذف عرض السعر'),
      message: `${this.lang.t('هل أنت متأكد من حذف عرض السعر')} ${quote.quoteNumber}؟`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، حذف'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.data.deleteQuote(quote.id);
        this.refresh();
        this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), detail: quote.quoteNumber, life: 3000 });
      },
    });
  }
}
