import { ModuleKey, Permission, UserRole } from '../models/models';

export interface RoleMeta {
  role: UserRole;
  roleLabel: string;
  modules: ModuleKey[];
  permissions: Permission[];
  duties: string[];
}

export const ALL_PERMISSIONS: Permission[] = [
  'quotes.create',
  'quotes.approve',
  'customers.create',
  'customers.transfer',
  'invoices.create',
  'invoices.recordPayment',
  'invoices.markSent',
  'invoices.cancel',
  'collections.manage',
  'users.manage',
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  'quotes.create': 'إنشاء ومتابعة عروض الأسعار',
  'quotes.approve': 'اعتماد أو رفض عروض الأسعار',
  'customers.create': 'إضافة عملاء جدد',
  'customers.transfer': 'نقل ملكية العملاء بين المندوبين',
  'invoices.create': 'إصدار فواتير جديدة',
  'invoices.recordPayment': 'تسجيل دفعات على الفواتير',
  'invoices.markSent': 'إصدار وإرسال المسودات',
  'invoices.cancel': 'إلغاء الفواتير',
  'collections.manage': 'إدارة متابعات التحصيل',
  'users.manage': 'إدارة المستخدمين والصلاحيات',
};

export const ROLE_META: Record<UserRole, RoleMeta> = {
  admin: {
    role: 'admin',
    roleLabel: 'مدير عام',
    modules: ['sales', 'finance'],
    permissions: [...ALL_PERMISSIONS],
    duties: [
      'الوصول الكامل لوحدتي المبيعات والحسابات',
      'إدارة المستخدمين وتحديد أدوارهم وصلاحياتهم',
      'اعتماد عروض الأسعار وإلغاء الفواتير عند الحاجة',
      'الإشراف العام على أداء الفريقين',
    ],
  },
  sales: {
    role: 'sales',
    roleLabel: 'مندوب مبيعات',
    modules: ['sales'],
    permissions: ['quotes.create', 'customers.create'],
    duties: [
      'إنشاء عروض الأسعار ومتابعتها حتى التحويل لأمر بيع',
      'إدارة العملاء المسندين إليه وتسجيل أنشطة التواصل',
      'طلب اعتماد مدير المبيعات على العروض ذات الخصومات الكبيرة',
    ],
  },
  sales_manager: {
    role: 'sales_manager',
    roleLabel: 'مدير مبيعات',
    modules: ['sales'],
    permissions: ['quotes.create', 'quotes.approve', 'customers.create', 'customers.transfer'],
    duties: [
      'اعتماد أو رفض عروض الأسعار التي تتطلب موافقة',
      'نقل ملكية العملاء بين مندوبي المبيعات',
      'متابعة أداء فريق المبيعات مقابل المستهدفات',
    ],
  },
  accountant: {
    role: 'accountant',
    roleLabel: 'محاسب',
    modules: ['finance'],
    permissions: ['invoices.create', 'invoices.recordPayment', 'invoices.markSent', 'collections.manage'],
    duties: [
      'إصدار الفواتير وتسجيل الدفعات الواردة من العملاء',
      'متابعة الفواتير المتأخرة وتسجيل إجراءات التحصيل',
      'إعداد تقارير أعمار الديون وحالة العملاء الائتمانية',
    ],
  },
};

export function defaultRouteForModules(modules: ModuleKey[]): string {
  if (modules.includes('sales')) return '/dashboard';
  if (modules.includes('finance')) return '/finance/dashboard';
  return '/login';
}
