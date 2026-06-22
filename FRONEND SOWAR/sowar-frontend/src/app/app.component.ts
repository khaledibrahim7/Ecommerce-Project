import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a [routerLink]="auth.isAdmin() && !isPreview() ? '/admin' : '/'" class="brand" aria-label="سوار">
        <span class="brand-word">سوار</span>
      </a>

      <nav aria-label="القائمة الرئيسية">
        @if (auth.isAdmin() && !isPreview()) {
          <a routerLink="/admin" routerLinkActive="active">لوحة التحكم</a>
          <a routerLink="/preview/products" routerLinkActive="active">معاينة المتجر</a>
        } @else {
          <a [routerLink]="isPreview() ? '/preview/products' : '/products'" routerLinkActive="active">المنتجات</a>
          @if (!isPreview()) {
            <a routerLink="/cart" routerLinkActive="active">السلة</a>
            <a routerLink="/wishlist" routerLinkActive="active">المفضلة</a>
            <a routerLink="/orders" routerLinkActive="active">طلباتي</a>
          }
        }
      </nav>

      <div class="actions">
        @if (auth.isAdmin() && isPreview()) {
          <a routerLink="/admin">رجوع للوحة التحكم</a>
        } @else if (auth.isLoggedIn()) {
          <a routerLink="/profile">حسابي</a>
          <a routerLink="/logout">تسجيل خروج</a>
        } @else {
          <a routerLink="/login" class="login">دخول</a>
        }
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div>
        <strong>سوار</strong>
        <span>عسل طبيعي، طلبات منظمة، وشحن واضح حسب المحافظة.</span>
      </div>
      <nav aria-label="روابط سريعة">
        @if (auth.isAdmin() && !isPreview()) {
          <a routerLink="/admin">لوحة التحكم</a>
        } @else {
          <a routerLink="/products">المنتجات</a>
          <a routerLink="/cart">السلة</a>
          <a routerLink="/orders">طلباتي</a>
        }
      </nav>
    </footer>

    <div class="toasts">
      @for (message of toast.messages(); track message.id) {
        <button class="toast" [class]="message.type" type="button" (click)="toast.dismiss(message.id)">
          {{ message.text }}
        </button>
      }
    </div>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public auth: AuthService, public toast: ToastService, private router: Router) {}

  isPreview() {
    return this.router.url.startsWith('/preview');
  }
}
