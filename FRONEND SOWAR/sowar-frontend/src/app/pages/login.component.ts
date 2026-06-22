import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { LoginType } from '../core/models';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page auth">
      <div class="card panel">
        <h1>تسجيل الدخول</h1>
        <label>طريقة الدخول
          <select [(ngModel)]="loginType">
            <option value="PHONE">رقم الهاتف</option>
            <option value="EMAIL">الإيميل</option>
          </select>
        </label>
        <label>البيان
          <input [(ngModel)]="identifier" placeholder="010... أو email@example.com">
        </label>
        <label>كلمة المرور
          <input [(ngModel)]="password" type="password">
        </label>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="btn" (click)="submit()">دخول</button>
        <a routerLink="/register">ليس لديك حساب؟ سجل الآن</a>
      </div>
    </section>
  `,
  styles: [`.auth { display: grid; place-items: center; } .panel { width: min(460px, 100%); display: grid; gap: 14px; padding: 22px; } .error { color: #b91c1c; }`]
})
export class LoginComponent {
  loginType: LoginType = 'PHONE';
  identifier = '';
  password = '';
  error = '';

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  submit() {
    this.api.login(this.loginType, this.identifier, this.password).subscribe({
      next: response => { this.auth.setSession(response); this.router.navigateByUrl(response.role === 'ADMIN' ? '/admin' : '/'); },
      error: () => this.error = 'بيانات الدخول غير صحيحة'
    });
  }
}
