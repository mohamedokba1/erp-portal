import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AppUser } from '../../../core/models/models';
import { LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, public lang: LanguageService) {}

  get demoUsers(): AppUser[] {
    return this.auth.demoUsers.filter(u => u.active);
  }

  roleIcon(user: AppUser): string {
    const map: Record<string, string> = {
      admin: 'pi-shield',
      sales: 'pi-briefcase',
      sales_manager: 'pi-verified',
      accountant: 'pi-wallet',
    };
    return map[user.role] ?? 'pi-user';
  }

  fillDemo(user: AppUser): void {
    this.email = user.email;
    this.password = user.password;
    this.error = '';
  }

  quickLogin(user: AppUser): void {
    this.fillDemo(user);
    this.submit();
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error = this.lang.t('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    this.loading = true;
    this.error = '';
    setTimeout(() => {
      const result = this.auth.login(this.email, this.password);
      this.loading = false;
      if (result === 'inactive') {
        this.error = this.lang.t('تم إيقاف هذا الحساب. يرجى التواصل مع مدير النظام.');
        return;
      }
      if (!result) {
        this.error = this.lang.t('بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور.');
        return;
      }
      this.router.navigateByUrl(this.auth.defaultRoute());
    }, 450);
  }
}
