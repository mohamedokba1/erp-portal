import { Injectable, signal } from '@angular/core';
import { AppUser, ModuleKey, Permission, UserRole } from '../models/models';
import { ROLE_META, defaultRouteForModules } from './roles';

const STORAGE_KEY = 'meridian_erp_session';
const repColors = ['#2C5F8A', '#1B8A5A', '#C77D1D', '#7A4FA0', '#B0342A', '#3F7ab0', '#0f2a4a', '#8a5a2c'];

@Injectable({ providedIn: 'root' })
export class AuthService {

  users = signal<AppUser[]>([
    {
      id: 'u1',
      name: 'خالد إبراهيم',
      email: 'admin@meridian.com',
      password: 'admin123',
      role: 'admin',
      roleLabel: ROLE_META.admin.roleLabel,
      title: 'صلاحية كاملة على المبيعات والحسابات',
      avatarColor: '#0f2a4a',
      modules: ROLE_META.admin.modules,
      active: true,
    },
    {
      id: 'u2',
      name: 'أحمد فتحي',
      email: 'sales@meridian.com',
      password: 'sales123',
      role: 'sales',
      roleLabel: ROLE_META.sales.roleLabel,
      title: 'صلاحية على وحدة المبيعات فقط',
      avatarColor: '#2C5F8A',
      modules: ROLE_META.sales.modules,
      active: true,
    },
    {
      id: 'u4',
      name: 'عمر الشناوي',
      email: 'sales.manager@meridian.com',
      password: 'manager123',
      role: 'sales_manager',
      roleLabel: ROLE_META.sales_manager.roleLabel,
      title: 'اعتماد عروض الأسعار وإدارة فريق المبيعات',
      avatarColor: '#7A4FA0',
      modules: ROLE_META.sales_manager.modules,
      active: true,
    },
    {
      id: 'u3',
      name: 'منى الشريف',
      email: 'accounting@meridian.com',
      password: 'finance123',
      role: 'accountant',
      roleLabel: ROLE_META.accountant.roleLabel,
      title: 'صلاحية على وحدة الحسابات فقط',
      avatarColor: '#1B8A5A',
      modules: ROLE_META.accountant.modules,
      active: true,
    },
  ]);

  /** kept for backwards-compat call sites / the login screen's demo-account list */
  get demoUsers(): AppUser[] {
    return this.users();
  }

  private _currentUser = signal<AppUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this._currentUser.set(this.restore());
  }

  private restore(): AppUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const id = JSON.parse(raw)?.id;
      return this.users().find(u => u.id === id) ?? null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): boolean | 'inactive' {
    const user = this.users().find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return false;
    if (!user.active) return 'inactive';
    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id }));
    return true;
  }

  loginAsDemo(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (!user || !user.active) return;
    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id }));
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasAccess(module: ModuleKey): boolean {
    return this._currentUser()?.modules.includes(module) ?? false;
  }

  can(permission: Permission): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return ROLE_META[user.role].permissions.includes(permission);
  }

  defaultRoute(): string {
    const user = this._currentUser();
    if (!user) return '/login';
    return defaultRouteForModules(user.modules);
  }

  // ---------- user management (admin only, enforced by the calling UI/guard) ----------

  addUser(input: { name: string; email: string; password: string; role: UserRole }): AppUser {
    const meta = ROLE_META[input.role];
    const user: AppUser = {
      id: 'u-' + Date.now(),
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      roleLabel: meta.roleLabel,
      title: meta.duties[0],
      avatarColor: repColors[this.users().length % repColors.length],
      modules: meta.modules,
      active: true,
    };
    this.users.update(list => [...list, user]);
    return user;
  }

  updateUserRole(userId: string, role: UserRole): void {
    const meta = ROLE_META[role];
    this.users.update(list => list.map(u => u.id === userId
      ? { ...u, role, roleLabel: meta.roleLabel, modules: meta.modules, title: meta.duties[0] }
      : u));
    if (this._currentUser()?.id === userId) {
      this._currentUser.set(this.users().find(u => u.id === userId) ?? null);
    }
  }

  toggleActive(userId: string): void {
    this.users.update(list => list.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  }

  updateUser(userId: string, changes: { name: string; email: string; password?: string }): void {
    this.users.update(list => list.map(u => u.id === userId
      ? { ...u, name: changes.name, email: changes.email, password: changes.password || u.password }
      : u));
    if (this._currentUser()?.id === userId) {
      this._currentUser.set(this.users().find(u => u.id === userId) ?? null);
    }
  }

  deleteUser(userId: string): void {
    if (this._currentUser()?.id === userId) return;
    this.users.update(list => list.filter(u => u.id !== userId));
  }
}
