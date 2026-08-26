import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FinanceDataService } from '../../../../core/data/finance-data.service';
import { Invoice, InvoiceStatus, Customer, PaymentMethod } from '../../../../core/models/models';
import { AuthService } from '../../../../core/auth/auth.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../../core/i18n/language.service';

interface DraftLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, DropdownModule, ConfirmDialogModule, TranslatePipe],
  providers: [ConfirmationService],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  customers: Customer[] = [];
  searchTerm = '';
  statusFilter: InvoiceStatus | 'الكل' = 'الكل';

  statusOptions: (InvoiceStatus | 'الكل')[] = [
    'الكل', 'مسودة', 'مرسلة', 'مدفوعة جزئياً', 'مدفوعة بالكامل', 'متأخرة', 'ملغاة',
  ];

  paymentMethods: PaymentMethod[] = ['تحويل بنكي', 'شيك', 'نقدي', 'بطاقة ائتمان'];

  // detail dialog
  showDetail = false;
  selectedInvoice: Invoice | null = null;

  // create dialog
  showCreate = false;
  newInvoice = this.emptyDraft();

  // payment dialog
  showPayment = false;
  paymentTarget: Invoice | null = null;
  paymentForm = { amount: 0, date: this.todayStr(), method: 'تحويل بنكي' as PaymentMethod, reference: '' };

  constructor(
    private finance: FinanceDataService,
    private confirm: ConfirmationService,
    private toast: MessageService,
    public auth: AuthService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.customers = this.finance.getCustomersForPicker();
  }

  private refresh(): void {
    this.invoices = this.finance.getInvoices()
      .slice()
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }

  private todayStr(): string {
    return '2026-08-21';
  }

  private emptyDraft() {
    return {
      customerId: '',
      issueDate: this.todayStr(),
      dueDate: '',
      paymentTerms: 'صافي 30 يوم',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, taxPercent: 14 }] as DraftLineItem[],
    };
  }

  get filtered(): Invoice[] {
    return this.invoices.filter(inv => {
      const matchesStatus = this.statusFilter === 'الكل' || inv.status === this.statusFilter;
      const matchesSearch =
        !this.searchTerm ||
        inv.customerName.includes(this.searchTerm) ||
        inv.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  get totalOutstanding(): number {
    return this.invoices
      .filter(i => i.status !== 'ملغاة')
      .reduce((s, i) => s + this.finance.invoiceRemaining(i), 0);
  }

  get overdueCount(): number {
    return this.invoices.filter(i => this.finance.isOverdue(i)).length;
  }

  // ---------- computed passthroughs ----------
  subtotal = (inv: Invoice) => this.finance.invoiceSubtotal(inv);
  tax = (inv: Invoice) => this.finance.invoiceTax(inv);
  total = (inv: Invoice) => this.finance.invoiceTotal(inv);
  paid = (inv: Invoice) => this.finance.invoicePaid(inv);
  remaining = (inv: Invoice) => this.finance.invoiceRemaining(inv);
  isOverdue = (inv: Invoice) => this.finance.isOverdue(inv);

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

  // ---------- detail dialog ----------
  openDetail(inv: Invoice): void {
    this.selectedInvoice = inv;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedInvoice = null;
  }

  sendReminder(inv: Invoice): void {
    const detail = this.lang.isEn()
      ? `Payment reminder sent to ${inv.customerName} for invoice ${inv.invoiceNumber} (demo simulation).`
      : `تم إرسال تذكير سداد إلى ${inv.customerName} بخصوص الفاتورة ${inv.invoiceNumber} (محاكاة تجريبية).`;
    this.toast.add({ severity: 'info', summary: this.lang.t('تم إرسال التذكير'), detail, life: 3500 });
  }

  downloadPdf(inv: Invoice): void {
    this.toast.add({
      severity: 'warn',
      summary: this.lang.t('نسخة تجريبية'),
      detail: this.lang.t('تصدير PDF غير متاح في هذه النسخة التجريبية الثابتة.'),
      life: 3000,
    });
  }

  markSent(inv: Invoice): void {
    this.finance.markSent(inv.id);
    this.refresh();
    const detail = this.lang.isEn() ? `Invoice ${inv.invoiceNumber} sent to the customer.` : `تم إرسال الفاتورة ${inv.invoiceNumber} للعميل.`;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم الإرسال'), detail, life: 3000 });
  }

  canCancel(): boolean {
    return this.auth.can('invoices.cancel');
  }

  confirmCancel(inv: Invoice): void {
    if (!this.canCancel()) {
      this.toast.add({ severity: 'error', summary: this.lang.t('نسخة تجريبية'), detail: this.lang.t('لا تملك صلاحية إلغاء الفواتير.'), life: 3500 });
      return;
    }
    this.confirm.confirm({
      header: this.lang.t('إلغاء الفاتورة'),
      message: `${this.lang.t('هل أنت متأكد من إلغاء الفاتورة')} ${inv.invoiceNumber}؟ ${this.lang.isEn() ? 'This action cannot be undone.' : 'لا يمكن التراجع عن هذا الإجراء.'}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، إلغاء الفاتورة'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.finance.cancelInvoice(inv.id);
        this.refresh();
        this.closeDetail();
        const detail = this.lang.isEn() ? `Invoice ${inv.invoiceNumber} has been cancelled.` : `تم إلغاء الفاتورة ${inv.invoiceNumber}.`;
        this.toast.add({ severity: 'error', summary: this.lang.t('تم الإلغاء'), detail, life: 3000 });
      },
    });
  }

  // ---------- create dialog ----------
  openCreate(): void {
    this.newInvoice = this.emptyDraft();
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  addLineItem(): void {
    this.newInvoice.items.push({ description: '', quantity: 1, unitPrice: 0, taxPercent: 14 });
  }

  removeLineItem(idx: number): void {
    if (this.newInvoice.items.length === 1) return;
    this.newInvoice.items.splice(idx, 1);
  }

  lineTotal(item: DraftLineItem): number {
    return item.quantity * item.unitPrice * (1 + item.taxPercent / 100);
  }

  get draftSubtotal(): number {
    return this.newInvoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  }

  get draftTax(): number {
    return this.newInvoice.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxPercent / 100), 0);
  }

  get draftTotal(): number {
    return this.draftSubtotal + this.draftTax;
  }

  get isDraftValid(): boolean {
    return (
      !!this.newInvoice.customerId &&
      !!this.newInvoice.dueDate &&
      this.newInvoice.items.every(i => i.description.trim() && i.quantity > 0 && i.unitPrice > 0)
    );
  }

  saveInvoice(asDraft: boolean): void {
    if (!this.isDraftValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى اختيار العميل، تاريخ الاستحقاق، وتعبئة كل بنود الفاتورة.'), life: 3500 });
      return;
    }
    const created = this.finance.addInvoice({
      customerId: this.newInvoice.customerId,
      issueDate: this.newInvoice.issueDate,
      dueDate: this.newInvoice.dueDate,
      paymentTerms: this.newInvoice.paymentTerms,
      notes: this.newInvoice.notes || undefined,
      items: this.newInvoice.items,
      asDraft,
    });
    this.refresh();
    this.showCreate = false;
    this.toast.add({
      severity: 'success',
      summary: asDraft ? this.lang.t('تم الحفظ كمسودة') : this.lang.t('تم إصدار الفاتورة'),
      detail: `${created.invoiceNumber} — ${created.customerName}`,
      life: 3500,
    });
  }

  // ---------- payment dialog ----------
  openPayment(inv: Invoice): void {
    this.paymentTarget = inv;
    this.paymentForm = { amount: this.remaining(inv), date: this.todayStr(), method: 'تحويل بنكي', reference: '' };
    this.showPayment = true;
  }

  closePayment(): void {
    this.showPayment = false;
    this.paymentTarget = null;
  }

  get isPaymentValid(): boolean {
    return !!this.paymentTarget && this.paymentForm.amount > 0 && this.paymentForm.amount <= this.remaining(this.paymentTarget) + 0.01;
  }

  savePayment(): void {
    if (!this.paymentTarget || !this.isPaymentValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('مبلغ غير صحيح'), detail: this.lang.t('يجب ألا يتجاوز المبلغ المدفوع المبلغ المتبقي على الفاتورة.'), life: 3500 });
      return;
    }
    const inv = this.paymentTarget;
    this.finance.recordPayment(inv.id, {
      date: this.paymentForm.date,
      amount: this.paymentForm.amount,
      method: this.paymentForm.method,
      reference: this.paymentForm.reference || '—',
      recordedBy: this.auth.currentUser()?.name ?? '—',
    });
    this.refresh();
    this.closePayment();
    if (this.selectedInvoice?.id === inv.id) {
      this.selectedInvoice = this.finance.getInvoiceById(inv.id) ?? null;
    }
    this.toast.add({ severity: 'success', summary: this.lang.t('تم تسجيل الدفعة'), detail: `${inv.invoiceNumber} — ${inv.customerName}`, life: 3500 });
  }
}
