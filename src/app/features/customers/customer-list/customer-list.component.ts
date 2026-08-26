import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { MockDataService } from '../../../core/data/mock-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Customer, CustomerTier, CustomerStatus } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { DaysAgoPipe } from '../../../core/i18n/days-ago.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableModule, DialogModule, DropdownModule, TranslatePipe, DaysAgoPipe],
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

  showCreate = false;
  repNames: string[] = [];
  newCustomer = { name: '', sector: '', city: '', phone: '', email: '', owner: '' };

  constructor(
    private data: MockDataService,
    public auth: AuthService,
    private toast: MessageService,
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

  private emptyDraft() {
    const user = this.auth.currentUser();
    return {
      name: '',
      sector: '',
      city: '',
      phone: '',
      email: '',
      owner: user?.role === 'sales' ? user.name : (this.repNames[0] ?? ''),
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
}
