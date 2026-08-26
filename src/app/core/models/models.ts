export type CustomerTier = 'استراتيجي' | 'رئيسي' | 'عادي';
export type CustomerStatus = 'نشط' | 'غير نشط' | 'محتمل';

export interface Customer {
  id: string;
  code: string;
  name: string;
  sector: string;
  tier: CustomerTier;
  status: CustomerStatus;
  city: string;
  phone: string;
  email: string;
  owner: string; // sales rep name
  ownerAvatarColor: string;
  totalRevenue: number;
  openQuotesValue: number;
  lastContactDaysAgo: number;
  createdAt: string;
}

export type ActivityType = 'زيارة' | 'مكالمة' | 'بريد إلكتروني' | 'اجتماع';

export interface CustomerActivity {
  id: string;
  type: ActivityType;
  date: string;
  summary: string;
  by: string;
}

export type QuoteStatus = 'مسودة' | 'بانتظار الاعتماد' | 'معتمد' | 'مرسل للعميل' | 'مرفوض' | 'محوّل لأمر بيع';

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  createdAt: string;
  validUntil: string;
  status: QuoteStatus;
  totalValue: number;
  discountPercent: number;
  requiresApproval: boolean;
  items: QuoteLineItem[];
}

export interface QuoteLineItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface SalesOrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  value: number;
  status: 'قيد التنفيذ' | 'تم التسليم' | 'فاتورة صادرة';
}

export interface KpiCard {
  label: string;
  value: string;
  delta: number; // % change, positive or negative
  deltaLabel: string;
  trend: number[]; // sparkline data
  icon: string;
  accent: 'navy' | 'success' | 'warning' | 'info';
}

export interface MonthlySalesPoint {
  month: string;
  actual: number;
  target: number;
}

export interface RepPerformance {
  name: string;
  avatarColor: string;
  achieved: number;
  target: number;
  dealsWon: number;
}

export interface FollowUpAlert {
  id: string;
  customerName: string;
  customerId: string;
  reason: string;
  daysOverdue: number;
  severity: 'low' | 'medium' | 'high';
}

// ============================================
// AUTH / ACCESS MANAGEMENT
// ============================================
export type ModuleKey = 'sales' | 'finance';
export type UserRole = 'admin' | 'sales' | 'sales_manager' | 'accountant';

export type Permission =
  | 'quotes.create'
  | 'quotes.approve'
  | 'customers.create'
  | 'customers.transfer'
  | 'invoices.create'
  | 'invoices.recordPayment'
  | 'invoices.markSent'
  | 'invoices.cancel'
  | 'collections.manage'
  | 'users.manage';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  avatarColor: string;
  modules: ModuleKey[];
  active: boolean;
}

// ============================================
// FINANCE / INVOICES
// ============================================
export type InvoiceStatus = 'مسودة' | 'مرسلة' | 'مدفوعة جزئياً' | 'مدفوعة بالكامل' | 'متأخرة' | 'ملغاة';
export type PaymentMethod = 'تحويل بنكي' | 'شيك' | 'نقدي' | 'بطاقة ائتمان';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  relatedOrderNumber?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentTerms: string;
  items: InvoiceLineItem[];
  payments: InvoicePayment[];
  createdBy: string;
  notes?: string;
}

export type PaymentBehavior = 'ملتزم' | 'متأخر أحياناً' | 'متعثر';

export interface ClientFinance {
  customerId: string;
  creditLimit: number;
  paymentBehavior: PaymentBehavior;
  avgPaymentDays: number;
}

export interface ClientFinanceSummary {
  customerId: string;
  customerName: string;
  customerCode: string;
  sector: string;
  city: string;
  creditLimit: number;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  overdueAmount: number;
  paymentBehavior: PaymentBehavior;
  avgPaymentDays: number;
  openInvoiceCount: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export interface MonthlyFinancePoint {
  month: string;
  invoiced: number;
  collected: number;
}

// ============================================
// COLLECTIONS
// ============================================
export type CollectionActivityType = 'اتصال هاتفي' | 'بريد إلكتروني' | 'زيارة ميدانية' | 'وعد بالسداد';

export interface CollectionActivity {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  type: CollectionActivityType;
  notes: string;
  promiseDate?: string;
  promiseAmount?: number;
  recordedBy: string;
}
