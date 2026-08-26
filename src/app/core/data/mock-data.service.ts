import { Injectable } from '@angular/core';
import {
  Customer, CustomerActivity, Quote, QuoteLineItem, KpiCard, MonthlySalesPoint,
  RepPerformance, FollowUpAlert, SalesOrderSummary
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  private repColors = ['#2C5F8A', '#1B8A5A', '#C77D1D', '#7A4FA0', '#B0342A', '#3F7ab0'];

  private customers: Customer[] = [
    { id: 'c1', code: 'CUS-1042', name: 'شركة النور للصناعات الغذائية', sector: 'صناعات غذائية', tier: 'استراتيجي', status: 'نشط', city: 'القاهرة', phone: '01001234567', email: 'sales@alnoor-food.com', owner: 'أحمد فتحي', ownerAvatarColor: this.repColors[0], totalRevenue: 1840000, openQuotesValue: 320000, lastContactDaysAgo: 2, createdAt: '2023-03-14' },
    { id: 'c2', code: 'CUS-1043', name: 'مجموعة الدلتا للتجارة والتوزيع', sector: 'تجارة وتوزيع', tier: 'رئيسي', status: 'نشط', city: 'الإسكندرية', phone: '01112345678', email: 'info@delta-trading.com', owner: 'سارة عبد الرحمن', ownerAvatarColor: this.repColors[1], totalRevenue: 965000, openQuotesValue: 145000, lastContactDaysAgo: 14, createdAt: '2022-11-02' },
    { id: 'c3', code: 'CUS-1044', name: 'مصنع الأمل للبلاستيك', sector: 'صناعات بلاستيكية', tier: 'عادي', status: 'نشط', city: 'العاشر من رمضان', phone: '01223456789', email: 'procurement@amal-plastics.com', owner: 'أحمد فتحي', ownerAvatarColor: this.repColors[0], totalRevenue: 412000, openQuotesValue: 0, lastContactDaysAgo: 41, createdAt: '2024-01-20' },
    { id: 'c4', code: 'CUS-1045', name: 'شركة المستقبل للمقاولات', sector: 'مقاولات وإنشاءات', tier: 'استراتيجي', status: 'نشط', city: 'الجيزة', phone: '01034567891', email: 'contact@future-const.com', owner: 'محمود عزت', ownerAvatarColor: this.repColors[2], totalRevenue: 2650000, openQuotesValue: 580000, lastContactDaysAgo: 1, createdAt: '2021-07-09' },
    { id: 'c5', code: 'CUS-1046', name: 'صيدليات الشفاء', sector: 'تجزئة صيدلية', tier: 'رئيسي', status: 'نشط', city: 'المنصورة', phone: '01145678912', email: 'purchase@elshifa-pharm.com', owner: 'نورهان سمير', ownerAvatarColor: this.repColors[3], totalRevenue: 780000, openQuotesValue: 95000, lastContactDaysAgo: 5, createdAt: '2023-09-01' },
    { id: 'c6', code: 'CUS-1047', name: 'مطاحن الوادي الحديثة', sector: 'صناعات غذائية', tier: 'رئيسي', status: 'محتمل', city: 'أسيوط', phone: '01256789123', email: 'info@wadi-mills.com', owner: 'سارة عبد الرحمن', ownerAvatarColor: this.repColors[1], totalRevenue: 0, openQuotesValue: 210000, lastContactDaysAgo: 8, createdAt: '2026-06-11' },
    { id: 'c7', code: 'CUS-1048', name: 'شركة السلام للأدوات المنزلية', sector: 'تجارة وتوزيع', tier: 'عادي', status: 'نشط', city: 'طنطا', phone: '01067891234', email: 'sales@salam-home.com', owner: 'محمود عزت', ownerAvatarColor: this.repColors[2], totalRevenue: 298000, openQuotesValue: 0, lastContactDaysAgo: 63, createdAt: '2022-04-17' },
    { id: 'c8', code: 'CUS-1049', name: 'مجموعة النيل الطبية', sector: 'رعاية صحية', tier: 'استراتيجي', status: 'نشط', city: 'القاهرة', phone: '01178912345', email: 'admin@nile-medical.com', owner: 'نورهان سمير', ownerAvatarColor: this.repColors[3], totalRevenue: 3120000, openQuotesValue: 450000, lastContactDaysAgo: 3, createdAt: '2020-12-05' },
    { id: 'c9', code: 'CUS-1050', name: 'مصانع الجنوب للنسيج', sector: 'نسيج وملابس', tier: 'عادي', status: 'غير نشط', city: 'المنيا', phone: '01289123456', email: 'export@south-textile.com', owner: 'أحمد فتحي', ownerAvatarColor: this.repColors[0], totalRevenue: 156000, openQuotesValue: 0, lastContactDaysAgo: 210, createdAt: '2021-02-28' },
    { id: 'c10', code: 'CUS-1051', name: 'شركة الرواد للتكنولوجيا', sector: 'تكنولوجيا معلومات', tier: 'رئيسي', status: 'نشط', city: 'القاهرة الجديدة', phone: '01091234567', email: 'procurement@rowad-tech.com', owner: 'محمود عزت', ownerAvatarColor: this.repColors[2], totalRevenue: 890000, openQuotesValue: 130000, lastContactDaysAgo: 6, createdAt: '2023-05-30' },
    { id: 'c11', code: 'CUS-1052', name: 'مجموعة الفا للاستيراد والتصدير', sector: 'استيراد وتصدير', tier: 'رئيسي', status: 'نشط', city: 'بورسعيد', phone: '01198765432', email: 'ops@alpha-import.com', owner: 'سارة عبد الرحمن', ownerAvatarColor: this.repColors[1], totalRevenue: 1120000, openQuotesValue: 0, lastContactDaysAgo: 22, createdAt: '2022-08-19' },
    { id: 'c12', code: 'CUS-1053', name: 'شركة الخليج للأثاث المكتبي', sector: 'أثاث وتجهيزات', tier: 'عادي', status: 'محتمل', city: 'الإسكندرية', phone: '01287654321', email: 'info@gulf-furniture.com', owner: 'نورهان سمير', ownerAvatarColor: this.repColors[3], totalRevenue: 0, openQuotesValue: 68000, lastContactDaysAgo: 4, createdAt: '2026-07-22' },
  ];

  private activities: Record<string, CustomerActivity[]> = {
    c1: [
      { id: 'a1', type: 'زيارة', date: '2026-08-17', summary: 'زيارة ميدانية لمناقشة عقد التوريد السنوي الجديد وزيادة الكمية المتعاقد عليها.', by: 'أحمد فتحي' },
      { id: 'a2', type: 'مكالمة', date: '2026-08-10', summary: 'متابعة حالة عرض السعر رقم QT-2201 وتأكيد مواعيد التسليم.', by: 'أحمد فتحي' },
      { id: 'a3', type: 'اجتماع', date: '2026-07-28', summary: 'اجتماع ربع سنوي لمراجعة الأداء ومناقشة خطة التوسع لعام 2027.', by: 'أحمد فتحي' },
      { id: 'a4', type: 'بريد إلكتروني', date: '2026-07-15', summary: 'إرسال كتالوج المنتجات الجديدة وقائمة الأسعار المحدثة.', by: 'أحمد فتحي' },
    ],
    c4: [
      { id: 'a5', type: 'زيارة', date: '2026-08-18', summary: 'معاينة موقع المشروع الجديد بالتجمع الخامس وتحديد المواصفات الفنية.', by: 'محمود عزت' },
      { id: 'a6', type: 'اجتماع', date: '2026-08-05', summary: 'اجتماع مع الإدارة المالية لمناقشة شروط السداد للمشروع الجديد.', by: 'محمود عزت' },
    ],
  };

  private quotes: Quote[] = [
    { id: 'q1', quoteNumber: 'QT-2201', customerId: 'c1', customerName: 'شركة النور للصناعات الغذائية', createdBy: 'أحمد فتحي', createdAt: '2026-08-10', validUntil: '2026-09-10', status: 'مرسل للعميل', totalValue: 320000, discountPercent: 5, requiresApproval: false,
      items: [
        { id: 'i1', productName: 'خط تعبئة أوتوماتيكي - موديل FX200', quantity: 1, unitPrice: 280000, discount: 5 },
        { id: 'i2', productName: 'قطع غيار وصيانة سنوية', quantity: 1, unitPrice: 40000, discount: 0 },
      ] },
    { id: 'q2', quoteNumber: 'QT-2198', customerId: 'c4', customerName: 'شركة المستقبل للمقاولات', createdBy: 'محمود عزت', createdAt: '2026-08-15', validUntil: '2026-09-15', status: 'بانتظار الاعتماد', totalValue: 580000, discountPercent: 18, requiresApproval: true,
      items: [
        { id: 'i3', productName: 'توريد حديد تسليح - 50 طن', quantity: 50, unitPrice: 9800, discount: 18 },
        { id: 'i4', productName: 'خدمات نقل ورفع', quantity: 1, unitPrice: 90000, discount: 10 },
      ] },
    { id: 'q3', quoteNumber: 'QT-2205', customerId: 'c8', customerName: 'مجموعة النيل الطبية', createdBy: 'نورهان سمير', createdAt: '2026-08-16', validUntil: '2026-09-16', status: 'معتمد', totalValue: 450000, discountPercent: 8, requiresApproval: false,
      items: [
        { id: 'i5', productName: 'أجهزة تحليل معملي - دفعة 12 جهاز', quantity: 12, unitPrice: 38000, discount: 8 },
      ] },
    { id: 'q4', quoteNumber: 'QT-2189', customerId: 'c2', customerName: 'مجموعة الدلتا للتجارة والتوزيع', createdBy: 'سارة عبد الرحمن', createdAt: '2026-08-02', validUntil: '2026-09-02', status: 'محوّل لأمر بيع', totalValue: 145000, discountPercent: 5, requiresApproval: false,
      items: [
        { id: 'i6', productName: 'بضائع متنوعة - طلبية شهرية', quantity: 1, unitPrice: 145000, discount: 5 },
      ] },
    { id: 'q5', quoteNumber: 'QT-2210', customerId: 'c6', customerName: 'مطاحن الوادي الحديثة', createdBy: 'سارة عبد الرحمن', createdAt: '2026-08-18', validUntil: '2026-09-18', status: 'مسودة', totalValue: 210000, discountPercent: 22, requiresApproval: true,
      items: [
        { id: 'i7', productName: 'معدات طحن ونظافة الحبوب', quantity: 1, unitPrice: 210000, discount: 22 },
      ] },
    { id: 'q6', quoteNumber: 'QT-2150', customerId: 'c9', customerName: 'مصانع الجنوب للنسيج', createdBy: 'أحمد فتحي', createdAt: '2026-06-20', validUntil: '2026-07-20', status: 'مرفوض', totalValue: 88000, discountPercent: 12, requiresApproval: true,
      items: [
        { id: 'i8', productName: 'خيوط قطنية - دفعة تجريبية', quantity: 1, unitPrice: 88000, discount: 12 },
      ] },
    { id: 'q7', quoteNumber: 'QT-2212', customerId: 'c12', customerName: 'شركة الخليج للأثاث المكتبي', createdBy: 'نورهان سمير', createdAt: '2026-08-15', validUntil: '2026-09-15', status: 'بانتظار الاعتماد', totalValue: 68000, discountPercent: 20, requiresApproval: true,
      items: [
        { id: 'i9', productName: 'أثاث مكتبي متكامل - 15 وحدة', quantity: 15, unitPrice: 4533, discount: 20 },
      ] },
    { id: 'q8', quoteNumber: 'QT-2199', customerId: 'c5', customerName: 'صيدليات الشفاء', createdBy: 'نورهان سمير', createdAt: '2026-08-12', validUntil: '2026-09-12', status: 'مرسل للعميل', totalValue: 95000, discountPercent: 6, requiresApproval: false,
      items: [
        { id: 'i10', productName: 'مستلزمات طبية متنوعة', quantity: 1, unitPrice: 95000, discount: 6 },
      ] },
    { id: 'q9', quoteNumber: 'QT-2213', customerId: 'c10', customerName: 'شركة الرواد للتكنولوجيا', createdBy: 'محمود عزت', createdAt: '2026-08-17', validUntil: '2026-09-17', status: 'معتمد', totalValue: 130000, discountPercent: 10, requiresApproval: false,
      items: [
        { id: 'i11', productName: 'أجهزة شبكات ومعدات خوادم', quantity: 1, unitPrice: 130000, discount: 10 },
      ] },
  ];

  private salesOrders: Record<string, SalesOrderSummary[]> = {
    c1: [
      { id: 'so1', orderNumber: 'SO-3401', date: '2026-07-01', value: 410000, status: 'فاتورة صادرة' },
      { id: 'so2', orderNumber: 'SO-3355', date: '2026-05-14', value: 280000, status: 'تم التسليم' },
    ],
    c4: [
      { id: 'so3', orderNumber: 'SO-3389', date: '2026-06-20', value: 920000, status: 'تم التسليم' },
    ],
  };

  private customerSeq = 1054;

  getCustomers(): Customer[] {
    return this.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  getSalesRepNames(): string[] {
    return this.getRepPerformance().map(r => r.name);
  }

  addCustomer(input: {
    name: string; sector: string; city: string; phone: string; email: string; owner: string;
  }): Customer {
    const rep = this.getRepPerformance().find(r => r.name === input.owner);
    const customer: Customer = {
      id: 'c-' + Date.now(),
      code: 'CUS-' + (this.customerSeq++),
      name: input.name,
      sector: input.sector,
      tier: 'عادي',
      status: 'محتمل',
      city: input.city,
      phone: input.phone,
      email: input.email,
      owner: input.owner,
      ownerAvatarColor: rep?.avatarColor ?? this.repColors[0],
      totalRevenue: 0,
      openQuotesValue: 0,
      lastContactDaysAgo: 0,
      createdAt: '2026-08-24',
    };
    this.customers.unshift(customer);
    return customer;
  }

  transferCustomerOwner(customerId: string, newOwner: string): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) return;
    const rep = this.getRepPerformance().find(r => r.name === newOwner);
    customer.owner = newOwner;
    customer.ownerAvatarColor = rep?.avatarColor ?? customer.ownerAvatarColor;
  }

  updateCustomer(id: string, changes: {
    name: string; sector: string; city: string; phone: string; email: string;
    tier: Customer['tier']; status: Customer['status'];
  }): void {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;
    Object.assign(customer, changes);
  }

  deleteCustomer(id: string): void {
    this.customers = this.customers.filter(c => c.id !== id);
    delete this.activities[id];
    this.quotes = this.quotes.filter(q => q.customerId !== id);
    delete this.salesOrders[id];
  }

  getActivitiesForCustomer(customerId: string): CustomerActivity[] {
    return this.activities[customerId] ?? [];
  }

  private activitySeq = 100;

  addActivity(customerId: string, input: { type: CustomerActivity['type']; date: string; summary: string; by: string }): void {
    if (!this.activities[customerId]) this.activities[customerId] = [];
    this.activities[customerId].unshift({ id: 'a-' + (this.activitySeq++) + '-' + Date.now(), ...input });
  }

  deleteActivity(customerId: string, activityId: string): void {
    if (!this.activities[customerId]) return;
    this.activities[customerId] = this.activities[customerId].filter(a => a.id !== activityId);
  }

  getQuotesForCustomer(customerId: string): Quote[] {
    return this.quotes.filter(q => q.customerId === customerId);
  }

  getOrdersForCustomer(customerId: string): SalesOrderSummary[] {
    return this.salesOrders[customerId] ?? [];
  }

  private quoteSeq = 2214;

  getAllQuotes(): Quote[] {
    return this.quotes;
  }

  addQuote(input: {
    customerId: string; validUntil: string; discountPercent: number;
    items: Omit<QuoteLineItem, 'id'>[]; createdBy: string;
  }): Quote {
    const customer = this.getCustomerById(input.customerId);
    const totalValue = input.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0);
    const requiresApproval = input.discountPercent >= 15;
    const quote: Quote = {
      id: 'q-' + Date.now(),
      quoteNumber: 'QT-' + (this.quoteSeq++),
      customerId: input.customerId,
      customerName: customer?.name ?? '—',
      createdBy: input.createdBy,
      createdAt: '2026-08-24',
      validUntil: input.validUntil,
      status: requiresApproval ? 'بانتظار الاعتماد' : 'مرسل للعميل',
      totalValue,
      discountPercent: input.discountPercent,
      requiresApproval,
      items: input.items.map((it, idx) => ({ ...it, id: 'qi-' + Date.now() + '-' + idx })),
    };
    this.quotes.unshift(quote);
    if (customer) customer.openQuotesValue += totalValue;
    return quote;
  }

  updateQuote(quoteId: string, input: {
    validUntil: string; discountPercent: number; items: Omit<QuoteLineItem, 'id'>[];
  }): void {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) return;
    const customer = this.getCustomerById(quote.customerId);
    if (customer) customer.openQuotesValue -= quote.totalValue;
    const totalValue = input.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0);
    const requiresApproval = input.discountPercent >= 15;
    quote.validUntil = input.validUntil;
    quote.discountPercent = input.discountPercent;
    quote.requiresApproval = requiresApproval;
    quote.totalValue = totalValue;
    quote.items = input.items.map((it, idx) => ({ ...it, id: 'qi-' + Date.now() + '-' + idx }));
    if (customer) customer.openQuotesValue += totalValue;
  }

  deleteQuote(quoteId: string): void {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) return;
    const customer = this.getCustomerById(quote.customerId);
    if (customer) customer.openQuotesValue = Math.max(0, customer.openQuotesValue - quote.totalValue);
    this.quotes = this.quotes.filter(q => q.id !== quoteId);
  }

  approveQuote(quoteId: string): void {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (quote) quote.status = 'معتمد';
  }

  rejectQuote(quoteId: string): void {
    const quote = this.quotes.find(q => q.id === quoteId);
    if (quote) quote.status = 'مرفوض';
  }

  getKpis(): KpiCard[] {
    return [
      { label: 'مبيعات الشهر الحالي', value: '4.82M ج.م', delta: 12.4, deltaLabel: 'عن الشهر الماضي', trend: [30, 42, 38, 51, 48, 62, 58, 71, 68, 82, 76, 91], icon: 'pi-chart-line', accent: 'navy' },
      { label: 'نسبة تحقيق المستهدف', value: '87%', delta: 4.1, deltaLabel: 'عن الأسبوع الماضي', trend: [60, 62, 65, 63, 70, 74, 78, 76, 80, 83, 85, 87], icon: 'pi-bullseye', accent: 'success' },
      { label: 'عملاء جدد هذا الشهر', value: '18', delta: -8.2, deltaLabel: 'عن الشهر الماضي', trend: [22, 25, 20, 24, 19, 21, 18, 20, 17, 19, 16, 18], icon: 'pi-user-plus', accent: 'info' },
      { label: 'نسبة تحويل العروض', value: '34%', delta: 2.7, deltaLabel: 'عن الربع الماضي', trend: [28, 29, 31, 30, 32, 33, 31, 34, 33, 35, 34, 34], icon: 'pi-percentage', accent: 'warning' },
    ];
  }

  getMonthlySales(): MonthlySalesPoint[] {
    return [
      { month: 'يناير', actual: 3.1, target: 3.4 },
      { month: 'فبراير', actual: 3.6, target: 3.5 },
      { month: 'مارس', actual: 3.4, target: 3.6 },
      { month: 'أبريل', actual: 3.9, target: 3.7 },
      { month: 'مايو', actual: 4.1, target: 3.9 },
      { month: 'يونيو', actual: 3.8, target: 4.0 },
      { month: 'يوليو', actual: 4.5, target: 4.2 },
      { month: 'أغسطس', actual: 4.82, target: 4.4 },
    ];
  }

  getRepPerformance(): RepPerformance[] {
    return [
      { name: 'أحمد فتحي', avatarColor: this.repColors[0], achieved: 1420000, target: 1500000, dealsWon: 14 },
      { name: 'محمود عزت', avatarColor: this.repColors[2], achieved: 1980000, target: 1700000, dealsWon: 11 },
      { name: 'سارة عبد الرحمن', avatarColor: this.repColors[1], achieved: 890000, target: 1200000, dealsWon: 9 },
      { name: 'نورهان سمير', avatarColor: this.repColors[3], achieved: 1310000, target: 1300000, dealsWon: 16 },
    ];
  }

  getFollowUpAlerts(): FollowUpAlert[] {
    return [
      { id: 'f1', customerName: 'مصانع الجنوب للنسيج', customerId: 'c9', reason: 'لا يوجد تواصل منذ فترة طويلة', daysOverdue: 210, severity: 'high' },
      { id: 'f2', customerName: 'شركة السلام للأدوات المنزلية', customerId: 'c7', reason: 'لم يتم المتابعة بعد آخر عرض سعر', daysOverdue: 63, severity: 'high' },
      { id: 'f3', customerName: 'مصنع الأمل للبلاستيك', customerId: 'c3', reason: 'عميل نشط بدون تواصل حديث', daysOverdue: 41, severity: 'medium' },
      { id: 'f4', customerName: 'مجموعة الفا للاستيراد والتصدير', customerId: 'c11', reason: 'تجديد العقد السنوي قريبًا', daysOverdue: 22, severity: 'low' },
    ];
  }
}
