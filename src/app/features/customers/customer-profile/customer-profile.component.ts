import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MockDataService } from '../../../core/data/mock-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Customer, CustomerActivity, CustomerTier, CustomerStatus, Quote, SalesOrderSummary, ActivityType } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DaysAgoPipe } from '../../../core/i18n/days-ago.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TabViewModule, DialogModule, DropdownModule, ConfirmDialogModule, TranslatePipe, DaysAgoPipe],
  providers: [ConfirmationService],
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

  showEdit = false;
  editDraft = { name: '', sector: '', city: '', phone: '', email: '', tier: 'عادي' as CustomerTier, status: 'محتمل' as CustomerStatus };
  tierChoices: CustomerTier[] = ['استراتيجي', 'رئيسي', 'عادي'];
  statusChoices: CustomerStatus[] = ['نشط', 'محتمل', 'غير نشط'];

  showActivity = false;
  activityTypes: ActivityType[] = ['زيارة', 'مكالمة', 'بريد إلكتروني', 'اجتماع'];
  activityDraft = { type: 'مكالمة' as ActivityType, date: '2026-08-26', summary: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: MockDataService,
    public auth: AuthService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
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

  canManageAny(): boolean {
    return this.auth.can('customers.transfer');
  }

  canEdit(): boolean {
    const user = this.auth.currentUser();
    if (!user || !this.customer) return false;
    if (this.canManageAny()) return true;
    return user.role === 'sales' && this.customer.owner === user.name;
  }

  // ---------- transfer ----------
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

  // ---------- edit ----------
  openEdit(): void {
    if (!this.customer) return;
    this.editDraft = {
      name: this.customer.name, sector: this.customer.sector, city: this.customer.city,
      phone: this.customer.phone, email: this.customer.email, tier: this.customer.tier, status: this.customer.status,
    };
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
  }

  get isEditValid(): boolean {
    return !!this.editDraft.name.trim() && !!this.editDraft.sector.trim() && !!this.editDraft.city.trim();
  }

  saveEdit(): void {
    if (!this.customer || !this.isEditValid) return;
    this.data.updateCustomer(this.customer.id, this.editDraft);
    this.customer = this.data.getCustomerById(this.customer.id);
    this.showEdit = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم حفظ التعديلات'), detail: this.customer?.name, life: 3000 });
  }

  // ---------- delete customer ----------
  confirmDeleteCustomer(): void {
    if (!this.customer) return;
    const name = this.customer.name;
    this.confirm.confirm({
      header: this.lang.t('حذف العميل'),
      message: `${this.lang.t('هل أنت متأكد من حذف')} ${name}؟ ${this.lang.isEn() ? 'This will also remove their quotes and activity history.' : 'سيؤدي هذا أيضاً لحذف عروض الأسعار وسجل التواصل الخاص به.'}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، حذف'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.data.deleteCustomer(this.customer!.id);
        this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), detail: name, life: 3000 });
        this.router.navigateByUrl('/customers');
      },
    });
  }

  // ---------- activities (communication log) ----------
  openAddActivity(): void {
    this.activityDraft = { type: 'مكالمة', date: '2026-08-26', summary: '' };
    this.showActivity = true;
  }

  closeAddActivity(): void {
    this.showActivity = false;
  }

  get isActivityValid(): boolean {
    return !!this.activityDraft.summary.trim();
  }

  saveActivity(): void {
    if (!this.customer || !this.isActivityValid) return;
    this.data.addActivity(this.customer.id, { ...this.activityDraft, by: this.auth.currentUser()?.name ?? '—' });
    this.activities = this.data.getActivitiesForCustomer(this.customer.id);
    this.showActivity = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم تسجيل النشاط'), life: 2500 });
  }

  deleteActivity(activity: CustomerActivity): void {
    if (!this.customer) return;
    this.data.deleteActivity(this.customer.id, activity.id);
    this.activities = this.data.getActivitiesForCustomer(this.customer.id);
    this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), life: 2000 });
  }
}
