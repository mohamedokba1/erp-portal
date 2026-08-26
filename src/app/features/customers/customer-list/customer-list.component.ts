import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MockDataService } from '../../../core/data/mock-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Customer, CustomerTier, CustomerStatus } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DaysAgoPipe } from '../../../core/i18n/days-ago.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

interface CustomerDraft {
  name: string; sector: string; city: string; phone: string; email: string; owner: string;
  tier: CustomerTier; status: CustomerStatus;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableModule, DialogModule, DropdownModule, ConfirmDialogModule, TranslatePipe, DaysAgoPipe],
  providers: [ConfirmationService],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';
  tierFilter: CustomerTier | 'الكل' = 'الكل';
  statusFilter: CustomerStatus | 'الكل' = 'الكل';

  tierOptions: (CustomerTier | 'الكل')[] = ['الكل', 'استراتيجي', 'رئيسي', 'عادي'];
  statusOptions: (CustomerStatus | 'الكل')[] = ['الكل', 'نشط', 'محتمل', 'غير نشط'];
  tierChoices: CustomerTier[] = ['استراتيجي', 'رئيسي', 'عادي'];
  statusChoices: CustomerStatus[] = ['نشط', 'محتمل', 'غير نشط'];

  showCreate = false;
  showEdit = false;
  editTarget: Customer | null = null;
  repNames: string[] = [];
  newCustomer: CustomerDraft = { name: '', sector: '', city: '', phone: '', email: '', owner: '', tier: 'عادي', status: 'محتمل' };
  editDraft: CustomerDraft = { name: '', sector: '', city: '', phone: '', email: '', owner: '', tier: 'عادي', status: 'محتمل' };

  constructor(
    private data: MockDataService,
    public auth: AuthService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.customers = this.data.getCustomers();
    this.repNames = this.data.getSalesRepNames();
    this.newCustomer = this.emptyDraft();
  }

  get filtered(): Customer[] {
    return this.customers.filter(c => {
      const matchesSearch =
        !this.searchTerm ||
        c.name.includes(this.searchTerm) ||
        c.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.owner.includes(this.searchTerm);
      const matchesTier = this.tierFilter === 'الكل' || c.tier === this.tierFilter;
      const matchesStatus = this.statusFilter === 'الكل' || c.status === this.statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }

  tierBadge(tier: CustomerTier): string {
    return tier === 'استراتيجي' ? 'navy' : tier === 'رئيسي' ? 'info' : 'neutral';
  }

  statusBadge(status: CustomerStatus): string {
    return status === 'نشط' ? 'success' : status === 'محتمل' ? 'warning' : 'neutral';
  }

  lastContactClass(days: number): string {
    if (days > 60) return 'danger';
    if (days > 21) return 'warning';
    return 'success';
  }

  canManageAny(): boolean {
    return this.auth.can('customers.transfer');
  }

  canEdit(c: Customer): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (this.canManageAny()) return true;
    return user.role === 'sales' && c.owner === user.name;
  }

  canDelete(): boolean {
    return this.canManageAny();
  }

  private emptyDraft(): CustomerDraft {
    const user = this.auth.currentUser();
    return {
      name: '', sector: '', city: '', phone: '', email: '',
      owner: user?.role === 'sales' ? user.name : (this.repNames[0] ?? ''),
      tier: 'عادي', status: 'محتمل',
    };
  }

  openCreate(): void {
    this.newCustomer = this.emptyDraft();
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  get isCreateValid(): boolean {
    return !!this.newCustomer.name.trim() && !!this.newCustomer.sector.trim() && !!this.newCustomer.city.trim();
  }

  saveCustomer(): void {
    if (!this.isCreateValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى تعبئة اسم الشركة، القطاع، والمدينة على الأقل.'), life: 3500 });
      return;
    }
    const created = this.data.addCustomer(this.newCustomer);
    this.showCreate = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم إنشاء العميل'), detail: `${created.code} — ${created.name}`, life: 3500 });
  }

  // ---------- edit ----------
  openEdit(c: Customer, event?: Event): void {
    event?.stopPropagation();
    this.editTarget = c;
    this.editDraft = { name: c.name, sector: c.sector, city: c.city, phone: c.phone, email: c.email, owner: c.owner, tier: c.tier, status: c.status };
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editTarget = null;
  }

  get isEditValid(): boolean {
    return !!this.editDraft.name.trim() && !!this.editDraft.sector.trim() && !!this.editDraft.city.trim();
  }

  saveEdit(): void {
    if (!this.editTarget || !this.isEditValid) return;
    this.data.updateCustomer(this.editTarget.id, this.editDraft);
    this.showEdit = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم حفظ التعديلات'), detail: `${this.editTarget.code} — ${this.editDraft.name}`, life: 3000 });
    this.editTarget = null;
  }

  // ---------- delete ----------
  confirmDelete(c: Customer, event?: Event): void {
    event?.stopPropagation();
    this.confirm.confirm({
      header: this.lang.t('حذف العميل'),
      message: `${this.lang.t('هل أنت متأكد من حذف')} ${c.name}؟ ${this.lang.isEn() ? 'This will also remove their quotes and activity history.' : 'سيؤدي هذا أيضاً لحذف عروض الأسعار وسجل التواصل الخاص به.'}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، حذف'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.data.deleteCustomer(c.id);
        this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), detail: c.name, life: 3000 });
      },
    });
  }
}
