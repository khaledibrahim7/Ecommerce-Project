import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { LoginType } from '../core/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page login-container fade-in">
      <div class="card login-card">
        <div class="login-card__header">
          <h1>{{ 'LoginTitle' | translate }}</h1>
          <p class="muted">{{ 'LoginSubtitle' | translate }}</p>
        </div>

        <form #form="ngForm" (ngSubmit)="submit()" class="login-form">
          <label>
            {{ (loginType === 'EMAIL' ? 'Email' : 'PhoneNumber') | translate }}
            <input name="identifier" [(ngModel)]="identifier" required [placeholder]="(loginType === 'EMAIL' ? 'EmailPlaceholder' : 'PhonePlaceholder') | translate">
          </label>

          <div class="login-type-toggle">
            <button type="button" class="link-btn" (click)="toggleLoginType()">{{ (loginType === 'EMAIL' ? 'UsePhoneInstead' : 'UseEmailInstead') | translate }}</button>
          </div>

          <label>
            {{ 'Password' | translate }}
            <div class="password-input-wrapper">
              <input [type]="passwordVisible ? 'text' : 'password'" name="password" [(ngModel)]="password" required [placeholder]="'PasswordPlaceholder' | translate">
              <span class="password-field__toggle" (click)="passwordVisible = !passwordVisible">
                @if (passwordVisible) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </span>
            </div>
          </label>

          @if (error) {
            <div class="error-box">
              {{ error }}
            </div>
          }

          <button type="submit" class="btn" [disabled]="form.invalid">{{ 'Login' | translate }}</button>
        </form>

        <div class="divider">{{ 'OR' | translate }}</div>
        <a routerLink="/register" class="btn secondary" style="width: 100%;">{{ 'CreateAccount' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: var(--spacing-xl);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: var(--spacing-2xl);
      border-color: rgba(212, 163, 92, 0.3) !important;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 163, 92, 0.05) !important;
    }

    .login-card__header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .login-type-toggle {
      display: flex;
      gap: var(--spacing-lg);
      font-size: 0.9rem;
    }

    .login-type-toggle label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
    }

    .login-type-toggle input[type="radio"] {
      width: auto;
      accent-color: var(--accent-primary);
    }

    .toggle-hint { display: inline-flex; gap: 8px; align-items: center; }
    .link-btn { background: none; border: none; padding: 0; color: var(--accent-primary); cursor: pointer; font-weight: 600; }

    .password-input-wrapper {
      position: relative;
      display: block;
      width: 100%;
    }

    .password-input-wrapper input {
      padding-inline-end: 44px !important;
      width: 100%;
    }

    .password-field__toggle {
      position: absolute;
      inset-inline-end: 14px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--text-muted);
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .error-box {
      background: rgba(185, 28, 28, 0.1);
      color: #b91c1c;
      border: 1px solid rgba(185, 28, 28, 0.2);
      padding: var(--spacing-lg);
      border-radius: var(--radius-md);
      text-align: center;
      font-weight: 500;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: var(--spacing-xl) 0;
      color: var(--text-muted);
    }

    .divider::before, .divider::after {
      content: '';
      flex-grow: 1;
      border-bottom: 1px solid var(--border-light);
    }

    .divider::before { margin-right: var(--spacing-lg); }
    .divider::after { margin-left: var(--spacing-lg); }
  `]
})
export class LoginComponent {
  loginType: LoginType = 'EMAIL';
  identifier = '';
  password = '';
  error = '';
  passwordVisible = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private translate: TranslateService) {}

  toggleLoginType() {
    this.loginType = this.loginType === 'EMAIL' ? 'PHONE' : 'EMAIL';
  }

  submit() {
    this.error = '';
    this.api.login(this.loginType, this.identifier, this.password).subscribe({
      next: response => { this.auth.setSession(response); this.router.navigateByUrl(response.role === 'ADMIN' ? '/admin' : '/'); },
      error: () => this.error = this.translate.instant('InvalidCredentials')
    });
  }
}
