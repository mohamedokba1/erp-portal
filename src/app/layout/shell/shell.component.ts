import { Component, computed, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/data/mock-data.service';
import { FinanceDataService } from '../../core/data/finance-data.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/i18n/language.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NotificationItem {
  icon: string;
  title: string;
  subtitle: string;
  route: string | any[];
  severity: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private elRef = inject(ElementRef<HTMLElement>);
  private salesData = inject(MockDataService);
  private financeData = inject(FinanceDataService);
  lang = inject(LanguageService);

  currentUser = this.auth.currentUser;
  userMenuOpen = false;
  notifMenuOpen = false;

  navSections = computed<NavSection[]>(() => {
    const user = this.currentUser();
    this.lang.lang(); // re-run on language toggle
    const sections: NavSection[] = [];

    if (user?.modules.includes('sales')) {
      sections.push({
        title: 'المبيعات',
        items: [
          { label: 'لوحة المؤشرات', icon: 'pi-th-large', route: '/dashboard' },
          { label: 'العملاء', icon: 'pi-building', route: '/customers' },
          { label: 'عروض الأسعار', icon: 'pi-file-edit', route: '/quotes' },
        ],
      });
    }

    if (user?.modules.includes('finance')) {
      const financeItems: NavItem[] = [
        { label: 'لوحة الحسابات', icon: 'pi-chart-bar', route: '/finance/dashboard' },
        { label: 'الفواتير', icon: 'pi-file', route: '/finance/invoices' },
        { label: 'الحالة المالية للعملاء', icon: 'pi-wallet', route: '/finance/clients' },
      ];
      if (this.auth.can('collections.manage')) {
        financeItems.push({ label: 'التحصيل', icon: 'pi-inbox', route: '/finance/collections' });
      }
      sections.push({ title: 'الحسابات', items: financeItems });
    }

    if (this.auth.can('users.manage')) {
      sections.push({
        title: 'الإدارة',
        items: [
          { label: 'المستخدمون والصلاحيات', icon: 'pi-shield', route: '/admin/users' },
        ],
      });
    }

    sections.push({ title: 'أقسام قادمة', items: [{ label: 'الموارد البشرية', icon: 'pi-users' }] });

    return sections;
  });

  notifications = computed<NotificationItem[]>(() => {
    const user = this.currentUser();
    this.lang.lang();
    if (!user) return [];
    const items: NotificationItem[] = [];

    if (user.modules.includes('sales')) {
      for (const a of this.salesData.getFollowUpAlerts().slice(0, 3)) {
        items.push({
          icon: 'pi-user-edit',
          title: a.customerName,
          subtitle: this.lang.t(a.reason),
          route: ['/customers', a.customerId],
          severity: a.severity === 'high' ? 'danger' : a.severity === 'medium' ? 'warning' : 'info',
        });
      }
      if (this.auth.can('quotes.approve')) {
        const pending = this.salesData.getAllQuotes().filter(q => q.status === 'بانتظار الاعتماد');
        for (const q of pending.slice(0, 3)) {
          items.push({
            icon: 'pi-verified',
            title: `${q.quoteNumber} — ${q.customerName}`,
            subtitle: this.lang.isEn() ? 'Awaiting your approval' : 'بانتظار اعتمادك',
            route: ['/quotes'],
            severity: 'warning',
          });
        }
      }
    }

    if (user.modules.includes('finance')) {
      for (const inv of this.financeData.getOverdueQueue().slice(0, 4)) {
        const days = this.financeData.daysOverdue(inv);
        items.push({
          icon: 'pi-exclamation-triangle',
          title: `${inv.invoiceNumber} — ${inv.customerName}`,
          subtitle: this.lang.isEn() ? `${days} days overdue` : `متأخرة ${days} يوم`,
          route: ['/finance/invoices'],
          severity: days > 60 ? 'danger' : 'warning',
        });
      }
    }

    return items;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.userMenuOpen && !this.elRef.nativeElement.querySelector('.user-menu')?.contains(target)) {
      this.userMenuOpen = false;
    }
    if (this.notifMenuOpen && !this.elRef.nativeElement.querySelector('.notif-menu')?.contains(target)) {
      this.notifMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.notifMenuOpen = false;
  }

  toggleNotifMenu(): void {
    this.notifMenuOpen = !this.notifMenuOpen;
    this.userMenuOpen = false;
  }

  closeNotifMenu(): void {
    this.notifMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
