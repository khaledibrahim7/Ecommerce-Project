import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { LoginType } from '../core/models';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page login-container fade-in">
      <div class="card login-card">
        <div class="login-card__header">
          <h1>Login</h1>
          <p class="muted">Welcome back! Log in to continue.</p>
        </div>

        <form #form="ngForm" (ngSubmit)="submit()" class="login-form">
          <label>
            Email or Phone Number
            <input name="identifier" [(ngModel)]="identifier" required [placeholder]="loginType === 'EMAIL' ? 'email@example.com' : '01...'">
          </label>

          <div class="login-type-toggle">
            <label>
              <input type="radio" name="loginType" value="EMAIL" [(ngModel)]="loginType">
              <span>Email</span>
            </label>
            <label>
              <input type="radio" name="loginType" value="PHONE" [(ngModel)]="loginType">
              <span>Phone Number</span>
            </label>
          </div>

          <label class="password-field">
            Password
            <input [type]="passwordVisible ? 'text' : 'password'" name="password" [(ngModel)]="password" required>
            <span class="password-field__toggle" (click)="passwordVisible = !passwordVisible">
              <!-- SVG icons here -->
            </span>
          </label>

          @if (error) {
            <div class="error-box">
              {{ error }}
            </div>
          }

          <button type="submit" class="btn" [disabled]="form.invalid">Login</button>
        </form>

        <div class="divider">OR</div>
        <a routerLink="/register" class="btn secondary" style="width: 100%;">Create a new account</a>
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

    .password-field {
      position: relative;
    }

    .password-field__toggle {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--text-muted);
      width: 20px;
      height: 20px;
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

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  submit() {
    this.error = ''; // Clear previous errors
    this.api.login(this.loginType, this.identifier, this.password).subscribe({
      next: response => { this.auth.setSession(response); this.router.navigateByUrl(response.role === 'ADMIN' ? '/admin' : '/'); },
      error: () => this.error = 'Invalid credentials. Please try again.'
    });
  }
}
