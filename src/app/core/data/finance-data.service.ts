import { Injectable } from '@angular/core';
import { MockDataService } from './mock-data.service';
import {
  Invoice, InvoiceLineItem, InvoicePayment, InvoiceStatus,
  ClientFinance, ClientFinanceSummary, AgingBucket, MonthlyFinancePoint,
  KpiCard, Customer, CollectionActivity,
} from '../models/models';

const TODAY = new Date('2026-08-21');

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

@Injectable({ providedIn: 'root' })
export class FinanceDataService {

  constructor(private salesData: MockDataService) {}

  private invoiceSeq = 5015;

  private invoices: Invoice[] = [
    {
      id: 'inv1', invoiceNumber: 'INV-5001', customerId: 'c1', customerName: 'شركة النور للصناعات الغذائية',
      relatedOrderNumber: 'SO-3401', issueDate: '2026-07-05', dueDate: '2026-08-04', status: 'مدفوعة بالكامل',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii1', description: 'خط تعبئة أوتوماتيكي - موديل FX200 (دفعة توريد)', quantity: 1, unitPrice: 300000, taxPercent: 14 }],
      payments: [{ id: 'p1', date: '2026-08-01', amount: 342000, method: 'تحويل بنكي', reference: 'TRX-88213', recordedBy: 'منى الشريف' }],
    },
    {
      id: 'inv2', invoiceNumber: 'INV-5002', customerId: 'c1', customerName: 'شركة النور للصناعات الغذائية',
      relatedOrderNumber: 'QT-2201', issueDate: '2026-08-10', dueDate: '2026-09-09', status: 'مرسلة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii2', description: 'قطع غيار وصيانة سنوية', quantity: 1, unitPrice: 280000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv3', invoiceNumber: 'INV-5003', customerId: 'c4', customerName: 'شركة المستقبل للمقاولات',
      relatedOrderNumber: 'SO-3389', issueDate: '2026-06-25', dueDate: '2026-07-25', status: 'مدفوعة جزئياً',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii3', description: 'توريد حديد تسليح - 70 طن', quantity: 70, unitPrice: 10000, taxPercent: 14 }],
      payments: [{ id: 'p2', date: '2026-07-20', amount: 400000, method: 'شيك', reference: 'CHK-4471', recordedBy: 'منى الشريف' }],
    },
    {
      id: 'inv4', invoiceNumber: 'INV-5004', customerId: 'c4', customerName: 'شركة المستقبل للمقاولات',
      issueDate: '2026-08-01', dueDate: '2026-08-31', status: 'مرسلة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii4', description: 'خدمات نقل ورفع ومعدات إنشائية', quantity: 1, unitPrice: 500000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv5', invoiceNumber: 'INV-5005', customerId: 'c2', customerName: 'مجموعة الدلتا للتجارة والتوزيع',
      relatedOrderNumber: 'QT-2189', issueDate: '2026-07-15', dueDate: '2026-08-14', status: 'متأخرة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii5', description: 'بضائع متنوعة - طلبية شهرية', quantity: 1, unitPrice: 130000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv6', invoiceNumber: 'INV-5006', customerId: 'c3', customerName: 'مصنع الأمل للبلاستيك',
      issueDate: '2026-05-10', dueDate: '2026-06-09', status: 'مدفوعة بالكامل',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii6', description: 'مواد بلاستيكية خام - دفعة إنتاج', quantity: 1, unitPrice: 160000, taxPercent: 14 }],
      payments: [{ id: 'p3', date: '2026-06-05', amount: 182400, method: 'تحويل بنكي', reference: 'TRX-87950', recordedBy: 'منى الشريف' }],
    },
    {
      id: 'inv7', invoiceNumber: 'INV-5007', customerId: 'c5', customerName: 'صيدليات الشفاء',
      relatedOrderNumber: 'QT-2199', issueDate: '2026-08-05', dueDate: '2026-09-04', status: 'مدفوعة جزئياً',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii7', description: 'مستلزمات طبية متنوعة', quantity: 1, unitPrice: 85000, taxPercent: 14 }],
      payments: [{ id: 'p4', date: '2026-08-15', amount: 40000, method: 'نقدي', reference: 'CASH-1122', recordedBy: 'منى الشريف' }],
    },
    {
      id: 'inv8', invoiceNumber: 'INV-5008', customerId: 'c7', customerName: 'شركة السلام للأدوات المنزلية',
      issueDate: '2026-06-01', dueDate: '2026-07-01', status: 'متأخرة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii8', description: 'أدوات منزلية - طلبية موسمية', quantity: 1, unitPrice: 65000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv9', invoiceNumber: 'INV-5009', customerId: 'c8', customerName: 'مجموعة النيل الطبية',
      relatedOrderNumber: 'QT-2205', issueDate: '2026-07-20', dueDate: '2026-08-19', status: 'متأخرة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii9', description: 'أجهزة تحليل معملي - دفعة 12 جهاز', quantity: 12, unitPrice: 33333, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv10', invoiceNumber: 'INV-5010', customerId: 'c8', customerName: 'مجموعة النيل الطبية',
      issueDate: '2026-08-18', dueDate: '2026-09-17', status: 'مسودة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii10', description: 'دفعة أجهزة طبية إضافية - قيد المراجعة', quantity: 1, unitPrice: 550000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv11', invoiceNumber: 'INV-5011', customerId: 'c9', customerName: 'مصانع الجنوب للنسيج',
      issueDate: '2026-03-01', dueDate: '2026-04-01', status: 'متأخرة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii11', description: 'خيوط قطنية - دفعة تجريبية', quantity: 1, unitPrice: 140000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv12', invoiceNumber: 'INV-5012', customerId: 'c10', customerName: 'شركة الرواد للتكنولوجيا',
      relatedOrderNumber: 'QT-2213', issueDate: '2026-08-01', dueDate: '2026-08-31', status: 'مدفوعة بالكامل',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii12', description: 'أجهزة شبكات ومعدات خوادم', quantity: 1, unitPrice: 115000, taxPercent: 14 }],
      payments: [{ id: 'p5', date: '2026-08-10', amount: 131100, method: 'بطاقة ائتمان', reference: 'CC-99031', recordedBy: 'منى الشريف' }],
    },
    {
      id: 'inv13', invoiceNumber: 'INV-5013', customerId: 'c11', customerName: 'مجموعة الفا للاستيراد والتصدير',
      issueDate: '2026-07-01', dueDate: '2026-07-31', status: 'ملغاة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف', notes: 'تم إلغاؤها لتعديل بنود الشحنة وإعادة الإصدار.',
      items: [{ id: 'ii13', description: 'بضائع مستوردة - شحنة ملغاة', quantity: 1, unitPrice: 300000, taxPercent: 14 }],
      payments: [],
    },
    {
      id: 'inv14', invoiceNumber: 'INV-5014', customerId: 'c11', customerName: 'مجموعة الفا للاستيراد والتصدير',
      issueDate: '2026-08-12', dueDate: '2026-09-11', status: 'مرسلة',
      paymentTerms: 'صافي 30 يوم', createdBy: 'منى الشريف',
      items: [{ id: 'ii14', description: 'بضائع مستوردة - شحنة بديلة', quantity: 1, unitPrice: 185000, taxPercent: 14 }],
      payments: [],
    },
  ];

  private clientFinance: Record<string, ClientFinance> = {
    c1: { customerId: 'c1', creditLimit: 800000, paymentBehavior: 'ملتزم', avgPaymentDays: 22 },
    c2: { customerId: 'c2', creditLimit: 300000, paymentBehavior: 'متأخر أحياناً', avgPaymentDays: 41 },
    c3: { customerId: 'c3', creditLimit: 250000, paymentBehavior: 'ملتزم', avgPaymentDays: 18 },
    c4: { customerId: 'c4', creditLimit: 1500000, paymentBehavior: 'متأخر أحياناً', avgPaymentDays: 38 },
    c5: { customerId: 'c5', creditLimit: 200000, paymentBehavior: 'ملتزم', avgPaymentDays: 25 },
    c7: { customerId: 'c7', creditLimit: 150000, paymentBehavior: 'متعثر', avgPaymentDays: 67 },
    c8: { customerId: 'c8', creditLimit: 900000, paymentBehavior: 'متأخر أحياناً', avgPaymentDays: 35 },
    c9: { customerId: 'c9', creditLimit: 100000, paymentBehavior: 'متعثر', avgPaymentDays: 98 },
    c10: { customerId: 'c10', creditLimit: 350000, paymentBehavior: 'ملتزم', avgPaymentDays: 15 },
    c11: { customerId: 'c11', creditLimit: 500000, paymentBehavior: 'متأخر أحياناً', avgPaymentDays: 33 },
  };

  private collectionActivities: CollectionActivity[] = [
    { id: 'col1', invoiceId: 'inv5', invoiceNumber: 'INV-5005', customerId: 'c2', customerName: 'مجموعة الدلتا للتجارة والتوزيع', date: '2026-08-18', type: 'اتصال هاتفي', notes: 'تم التواصل مع مدير المشتريات، أفاد بأن السداد سيتم خلال أسبوع بعد اعتماد الشيك.', recordedBy: 'منى الشريف' },
    { id: 'col2', invoiceId: 'inv5', invoiceNumber: 'INV-5005', customerId: 'c2', customerName: 'مجموعة الدلتا للتجارة والتوزيع', date: '2026-08-20', type: 'وعد بالسداد', notes: 'تأكيد وعد بالسداد عبر تحويل بنكي.', promiseDate: '2026-08-28', promiseAmount: 148200, recordedBy: 'منى الشريف' },
    { id: 'col3', invoiceId: 'inv8', invoiceNumber: 'INV-5008', customerId: 'c7', customerName: 'شركة السلام للأدوات المنزلية', date: '2026-08-05', type: 'بريد إلكتروني', notes: 'إرسال إشعار سداد أول عبر البريد الإلكتروني، لم يرد رد حتى الآن.', recordedBy: 'منى الشريف' },
    { id: 'col4', invoiceId: 'inv8', invoiceNumber: 'INV-5008', customerId: 'c7', customerName: 'شركة السلام للأدوات المنزلية', date: '2026-08-15', type: 'اتصال هاتفي', notes: 'لم يتم الرد على الاتصال، تم ترك رسالة صوتية.', recordedBy: 'منى الشريف' },
    { id: 'col5', invoiceId: 'inv11', invoiceNumber: 'INV-5011', customerId: 'c9', customerName: 'مصانع الجنوب للنسيج', date: '2026-07-10', type: 'زيارة ميدانية', notes: 'زيارة ميدانية لمصنع العميل، تبين وجود صعوبات تشغيلية تؤثر على السيولة.', recordedBy: 'منى الشريف' },
    { id: 'col6', invoiceId: 'inv11', invoiceNumber: 'INV-5011', customerId: 'c9', customerName: 'مصانع الجنوب للنسيج', date: '2026-08-01', type: 'اتصال هاتفي', notes: 'تصعيد الموضوع للإدارة القانونية إذا لم يتم السداد خلال 15 يوم.', recordedBy: 'منى الشريف' },
  ];

  private monthlyFinance: MonthlyFinancePoint[] = [
    { month: 'يناير', invoiced: 1.9, collected: 1.7 },
    { month: 'فبراير', invoiced: 2.2, collected: 1.9 },
    { month: 'مارس', invoiced: 2.0, collected: 2.1 },
    { month: 'أبريل', invoiced: 2.4, collected: 2.0 },
    { month: 'مايو', invoiced: 2.6, collected: 2.3 },
    { month: 'يونيو', invoiced: 2.3, collected: 2.5 },
    { month: 'يوليو', invoiced: 2.9, collected: 2.4 },
    { month: 'أغسطس', invoiced: 2.5, collected: 2.2 },
  ];

  // ---------- computed helpers ----------

  invoiceSubtotal(inv: Invoice): number {
    return inv.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }

  invoiceTax(inv: Invoice): number {
    return inv.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.taxPercent / 100), 0);
  }

  invoiceTotal(inv: Invoice): number {
    return this.invoiceSubtotal(inv) + this.invoiceTax(inv);
  }

  invoicePaid(inv: Invoice): number {
    return inv.payments.reduce((sum, p) => sum + p.amount, 0);
  }

  invoiceRemaining(inv: Invoice): number {
    return Math.max(0, this.invoiceTotal(inv) - this.invoicePaid(inv));
  }

  isOverdue(inv: Invoice): boolean {
    if (inv.status === 'ملغاة' || inv.status === 'مسودة') return false;
    return this.invoiceRemaining(inv) > 0 && new Date(inv.dueDate) < TODAY;
  }

  daysOverdue(inv: Invoice): number {
    return this.isOverdue(inv) ? daysBetween(TODAY, new Date(inv.dueDate)) : 0;
  }

  private recalcStatus(inv: Invoice): void {
    if (inv.status === 'ملغاة' || inv.status === 'مسودة') return;
    const total = this.invoiceTotal(inv);
    const paid = this.invoicePaid(inv);
    if (paid >= total) { inv.status = 'مدفوعة بالكامل'; return; }
    if (paid > 0) { inv.status = 'مدفوعة جزئياً'; return; }
    inv.status = new Date(inv.dueDate) < TODAY ? 'متأخرة' : 'مرسلة';
  }

  // ---------- reads ----------

  getInvoices(): Invoice[] {
    this.invoices.forEach(inv => this.recalcStatus(inv));
    return this.invoices;
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find(i => i.id === id);
  }

  getInvoicesForCustomer(customerId: string): Invoice[] {
    return this.getInvoices().filter(i => i.customerId === customerId);
  }

  getCustomersForPicker(): Customer[] {
    return this.salesData.getCustomers();
  }

  // ---------- writes ----------

  addInvoice(input: {
    customerId: string;
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    items: Omit<InvoiceLineItem, 'id'>[];
    notes?: string;
    asDraft: boolean;
  }): Invoice {
    const customer = this.salesData.getCustomerById(input.customerId);
    const number = this.invoiceSeq++;
    const invoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: 'INV-' + number,
      customerId: input.customerId,
      customerName: customer?.name ?? 'عميل غير معروف',
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: input.asDraft ? 'مسودة' : (new Date(input.dueDate) < TODAY ? 'متأخرة' : 'مرسلة'),
      paymentTerms: input.paymentTerms,
      createdBy: 'منى الشريف',
      notes: input.notes,
      items: input.items.map((it, idx) => ({ ...it, id: 'ii-' + Date.now() + '-' + idx })),
      payments: [],
    };
    this.invoices.unshift(invoice);
    return invoice;
  }

  recordPayment(invoiceId: string, payment: Omit<InvoicePayment, 'id'>): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    inv.payments.unshift({ ...payment, id: 'p-' + Date.now() });
    this.recalcStatus(inv);
  }

  deletePayment(invoiceId: string, paymentId: string): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    inv.payments = inv.payments.filter(p => p.id !== paymentId);
    this.recalcStatus(inv);
  }

  /** Editing/deleting an invoice outright is only allowed while it's still a draft —
   *  once issued, the correct way to adjust it is a payment, reminder, or cancellation. */
  updateInvoice(invoiceId: string, input: {
    customerId: string; issueDate: string; dueDate: string; paymentTerms: string;
    items: Omit<InvoiceLineItem, 'id'>[]; notes?: string;
  }): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status !== 'مسودة') return;
    const customer = this.salesData.getCustomerById(input.customerId);
    inv.customerId = input.customerId;
    inv.customerName = customer?.name ?? inv.customerName;
    inv.issueDate = input.issueDate;
    inv.dueDate = input.dueDate;
    inv.paymentTerms = input.paymentTerms;
    inv.notes = input.notes;
    inv.items = input.items.map((it, idx) => ({ ...it, id: 'ii-' + Date.now() + '-' + idx }));
  }

  deleteInvoice(invoiceId: string): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status !== 'مسودة') return;
    this.invoices = this.invoices.filter(i => i.id !== invoiceId);
  }

  markSent(invoiceId: string): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status !== 'مسودة') return;
    inv.status = new Date(inv.dueDate) < TODAY ? 'متأخرة' : 'مرسلة';
  }

  cancelInvoice(invoiceId: string): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    inv.status = 'ملغاة';
  }

  // ---------- aggregates ----------

  getFinanceKpis(): KpiCard[] {
    const invoices = this.getInvoices().filter(i => i.status !== 'ملغاة');
    const outstanding = invoices.reduce((s, i) => s + this.invoiceRemaining(i), 0);
    const overdue = invoices.filter(i => this.isOverdue(i)).reduce((s, i) => s + this.invoiceRemaining(i), 0);
    const collectedThisMonth = invoices
      .flatMap(i => i.payments)
      .filter(p => p.date.startsWith('2026-08'))
      .reduce((s, p) => s + p.amount, 0);
    const behaviors = Object.values(this.clientFinance);
    const avgDays = Math.round(behaviors.reduce((s, b) => s + b.avgPaymentDays, 0) / behaviors.length);

    return [
      { label: 'إجمالي المستحق للتحصيل', value: (outstanding / 1000).toFixed(0) + ' ألف ج.م', delta: -3.2, deltaLabel: 'عن الشهر الماضي', trend: [62, 58, 65, 60, 57, 55, 59, 54, 52, 56, 53, 51], icon: 'pi-wallet', accent: 'navy' },
      { label: 'متأخر السداد', value: (overdue / 1000).toFixed(0) + ' ألف ج.م', delta: 6.8, deltaLabel: 'عن الشهر الماضي', trend: [30, 32, 28, 35, 33, 38, 36, 40, 37, 42, 39, 44], icon: 'pi-exclamation-triangle', accent: 'warning' },
      { label: 'تم تحصيله هذا الشهر', value: (collectedThisMonth / 1000).toFixed(0) + ' ألف ج.م', delta: 9.4, deltaLabel: 'عن الشهر الماضي', trend: [40, 44, 42, 48, 46, 51, 49, 54, 52, 57, 55, 60], icon: 'pi-check-circle', accent: 'success' },
      { label: 'متوسط أيام التحصيل', value: avgDays + ' يوم', delta: -2.1, deltaLabel: 'تحسّن عن الربع الماضي', trend: [45, 43, 44, 41, 40, 39, 38, 37, 36, 35, 34, 33], icon: 'pi-clock', accent: 'info' },
    ];
  }

  getAgingBuckets(): AgingBucket[] {
    const buckets: AgingBucket[] = [
      { label: '1-30 يوم', amount: 0, count: 0 },
      { label: '31-60 يوم', amount: 0, count: 0 },
      { label: '61-90 يوم', amount: 0, count: 0 },
      { label: 'أكثر من 90 يوم', amount: 0, count: 0 },
    ];
    for (const inv of this.getInvoices()) {
      const days = this.daysOverdue(inv);
      if (days <= 0) continue;
      const remaining = this.invoiceRemaining(inv);
      const idx = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
      buckets[idx].amount += remaining;
      buckets[idx].count += 1;
    }
    return buckets;
  }

  getMonthlyFinance(): MonthlyFinancePoint[] {
    return this.monthlyFinance;
  }

  getClientFinanceSummaries(): ClientFinanceSummary[] {
    const customers = this.salesData.getCustomers();
    const invoices = this.getInvoices();
    return customers
      .map(c => {
        const clientInvoices = invoices.filter(i => i.customerId === c.id && i.status !== 'ملغاة');
        const fin = this.clientFinance[c.id];
        const totalInvoiced = clientInvoices.reduce((s, i) => s + this.invoiceTotal(i), 0);
        const totalPaid = clientInvoices.reduce((s, i) => s + this.invoicePaid(i), 0);
        const overdueAmount = clientInvoices.filter(i => this.isOverdue(i)).reduce((s, i) => s + this.invoiceRemaining(i), 0);
        return {
          customerId: c.id,
          customerName: c.name,
          customerCode: c.code,
          sector: c.sector,
          city: c.city,
          creditLimit: fin?.creditLimit ?? 0,
          totalInvoiced,
          totalPaid,
          outstanding: totalInvoiced - totalPaid,
          overdueAmount,
          paymentBehavior: fin?.paymentBehavior ?? 'ملتزم',
          avgPaymentDays: fin?.avgPaymentDays ?? 0,
          openInvoiceCount: clientInvoices.filter(i => this.invoiceRemaining(i) > 0).length,
        } as ClientFinanceSummary;
      })
      .filter(s => s.totalInvoiced > 0);
  }

  getClientFinanceSummary(customerId: string): ClientFinanceSummary | undefined {
    return this.getClientFinanceSummaries().find(s => s.customerId === customerId);
  }

  updateClientFinance(customerId: string, changes: {
    creditLimit: number; paymentBehavior: ClientFinanceSummary['paymentBehavior']; avgPaymentDays: number;
  }): void {
    this.clientFinance[customerId] = { customerId, ...changes };
  }

  // ---------- collections ----------

  /** Overdue invoices that need collections attention, worst-first. */
  getOverdueQueue(): Invoice[] {
    return this.getInvoices()
      .filter(inv => this.isOverdue(inv))
      .sort((a, b) => this.daysOverdue(b) - this.daysOverdue(a));
  }

  getCollectionActivitiesForInvoice(invoiceId: string): CollectionActivity[] {
    return this.collectionActivities
      .filter(a => a.invoiceId === invoiceId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getLastCollectionActivity(invoiceId: string): CollectionActivity | undefined {
    return this.getCollectionActivitiesForInvoice(invoiceId)[0];
  }

  getOpenPromisesCount(): number {
    const invoiceIds = new Set(this.getOverdueQueue().map(i => i.id));
    return this.collectionActivities.filter(a => a.promiseDate && invoiceIds.has(a.invoiceId)).length;
  }

  logCollectionActivity(invoiceId: string, activity: Omit<CollectionActivity, 'id' | 'invoiceId' | 'invoiceNumber' | 'customerId' | 'customerName'>): void {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    this.collectionActivities.unshift({
      ...activity,
      id: 'col-' + Date.now(),
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
    });
  }

  deleteCollectionActivity(activityId: string): void {
    this.collectionActivities = this.collectionActivities.filter(a => a.id !== activityId);
  }
}
