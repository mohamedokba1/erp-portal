import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { ALL_PERMISSIONS, PERMISSION_LABELS, ROLE_META } from '../../../core/auth/roles';
import { AppUser, Permission, UserRole } from '../../../core/models/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ConfirmDialogModule, TranslatePipe],
  providers: [ConfirmationService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  roles: UserRole[] = ['admin', 'sales_manager', 'sales', 'accountant'];
  roleMeta = ROLE_META;
  allPermissions: Permission[] = ALL_PERMISSIONS;
  permissionLabels = PERMISSION_LABELS;

  showCreate = false;
  newUser = { name: '', email: '', password: '', role: 'sales' as UserRole };

  showEdit = false;
  editTarget: AppUser | null = null;
  editDraft = { name: '', email: '', password: '' };

  constructor(
    public auth: AuthService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    public lang: LanguageService,
  ) {}

  get users(): AppUser[] {
    return this.auth.users();
  }

  get activeCount(): number {
    return this.users.filter(u => u.active).length;
  }

  get disabledCount(): number {
    return this.users.filter(u => !u.active).length;
  }

  roleBadge(role: UserRole): string {
    const map: Record<UserRole, string> = { admin: 'navy', sales_manager: 'info', sales: 'neutral', accountant: 'success' };
    return map[role];
  }

  isSelf(user: AppUser): boolean {
    return this.auth.currentUser()?.id === user.id;
  }

  toggleActive(user: AppUser): void {
    if (this.isSelf(user)) {
      this.toast.add({ severity: 'warn', summary: this.lang.t('نسخة تجريبية'), detail: this.lang.isEn() ? "You can't disable your own account." : 'لا يمكنك إيقاف حسابك الحالي.', life: 3500 });
      return;
    }
    this.auth.toggleActive(user.id);
  }

  onRoleChange(user: AppUser, role: UserRole): void {
    this.auth.updateUserRole(user.id, role);
    this.toast.add({ severity: 'success', summary: this.lang.t('تم تحديث دور المستخدم'), detail: `${user.name} — ${this.lang.t(this.roleMeta[role].roleLabel)}`, life: 3000 });
  }

  openCreate(): void {
    this.newUser = { name: '', email: '', password: '', role: 'sales' };
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  get isCreateValid(): boolean {
    return !!this.newUser.name.trim() && !!this.newUser.email.trim() && !!this.newUser.password.trim();
  }

  saveUser(): void {
    if (!this.isCreateValid) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('يرجى تعبئة الاسم، البريد الإلكتروني، وكلمة المرور.'), life: 3500 });
      return;
    }
    if (this.users.some(u => u.email.toLowerCase() === this.newUser.email.trim().toLowerCase())) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('هذا البريد الإلكتروني مستخدم بالفعل.'), life: 3500 });
      return;
    }
    const created = this.auth.addUser(this.newUser);
    this.showCreate = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم إنشاء المستخدم'), detail: `${created.name} — ${created.email}`, life: 3500 });
  }

  // ---------- edit ----------
  openEdit(user: AppUser): void {
    this.editTarget = user;
    this.editDraft = { name: user.name, email: user.email, password: '' };
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editTarget = null;
  }

  get isEditValid(): boolean {
    return !!this.editDraft.name.trim() && !!this.editDraft.email.trim();
  }

  saveEdit(): void {
    if (!this.editTarget || !this.isEditValid) return;
    if (this.users.some(u => u.id !== this.editTarget!.id && u.email.toLowerCase() === this.editDraft.email.trim().toLowerCase())) {
      this.toast.add({ severity: 'error', summary: this.lang.t('بيانات ناقصة'), detail: this.lang.t('هذا البريد الإلكتروني مستخدم بالفعل.'), life: 3500 });
      return;
    }
    this.auth.updateUser(this.editTarget.id, this.editDraft);
    this.showEdit = false;
    this.toast.add({ severity: 'success', summary: this.lang.t('تم حفظ التعديلات'), detail: this.editDraft.name, life: 3000 });
    this.editTarget = null;
  }

  // ---------- delete ----------
  confirmDelete(user: AppUser): void {
    if (this.isSelf(user)) {
      this.toast.add({ severity: 'warn', summary: this.lang.t('نسخة تجريبية'), detail: this.lang.isEn() ? "You can't delete your own account." : 'لا يمكنك حذف حسابك الحالي.', life: 3500 });
      return;
    }
    this.confirm.confirm({
      header: this.lang.t('حذف المستخدم'),
      message: `${this.lang.t('هل أنت متأكد من حذف المستخدم')} ${user.name}؟`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.lang.t('نعم، حذف'),
      rejectLabel: this.lang.t('تراجع'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.auth.deleteUser(user.id);
        this.toast.add({ severity: 'error', summary: this.lang.t('تم الحذف'), detail: user.name, life: 3000 });
      },
    });
  }
}
