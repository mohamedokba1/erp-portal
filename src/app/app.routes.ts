import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { CustomerProfileComponent } from './features/customers/customer-profile/customer-profile.component';
import { QuotesComponent } from './features/quotes/quotes.component';
import { LoginComponent } from './features/auth/login/login.component';
import { FinanceDashboardComponent } from './features/finance/finance-dashboard/finance-dashboard.component';
import { InvoiceListComponent } from './features/finance/invoices/invoice-list/invoice-list.component';
import { ClientStatusComponent } from './features/finance/clients-status/client-status.component';
import { CollectionsComponent } from './features/finance/collections/collections.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { authGuard, loginGuard, homeRedirectGuard, moduleGuard, permissionGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },

      // Sales / CRM module
      { path: 'dashboard', component: DashboardComponent, canActivate: [moduleGuard('sales')] },
      { path: 'customers', component: CustomerListComponent, canActivate: [moduleGuard('sales')] },
      { path: 'customers/:id', component: CustomerProfileComponent, canActivate: [moduleGuard('sales')] },
      { path: 'quotes', component: QuotesComponent, canActivate: [moduleGuard('sales')] },

      // Finance / Accounting module
      { path: 'finance/dashboard', component: FinanceDashboardComponent, canActivate: [moduleGuard('finance')] },
      { path: 'finance/invoices', component: InvoiceListComponent, canActivate: [moduleGuard('finance')] },
      { path: 'finance/clients', component: ClientStatusComponent, canActivate: [moduleGuard('finance')] },
      { path: 'finance/collections', component: CollectionsComponent, canActivate: [permissionGuard('collections.manage')] },

      // Administration
      { path: 'admin/users', component: UserManagementComponent, canActivate: [permissionGuard('users.manage')] },
    ],
  },
  { path: '**', canActivate: [homeRedirectGuard], children: [] },
];
