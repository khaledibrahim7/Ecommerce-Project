import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ApiService } from './core/api.service';
import { AuthService } from './core/auth.service';
import { AppNotification, ContactLink } from './core/models';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
      <header class="topbar">
          <button class="menu-btn" type="button" aria-label="Menu" (click)="toggleNav()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="#e6eef8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a [routerLink]="auth.isAdmin() && !isPreview() ? '/admin' : '/'" class="brand" aria-label="Sowar">
            <span class="brand-word">Sowar</span>
          </a>



          <nav aria-label="Main Menu">
        @if (auth.isAdmin() && !isPreview()) {
          <a routerLink="/admin" routerLinkActive="active">Dashboard</a>
          <a routerLink="/preview/products" routerLinkActive="active">Preview Store</a>
        } @else {
          <a [routerLink]="isPreview() ? '/preview/products' : '/products'" routerLinkActive="active">Products</a>
          @if (!isPreview()) {
            <a routerLink="/wishlist" routerLinkActive="active">Wishlist</a>
            <a routerLink="/orders" routerLinkActive="active">My Orders</a>
          }
        }
      </nav>

      <div class="actions">
        @if (auth.isLoggedIn()) {
          <div class="notifications">
            <button class="notification-btn" type="button" (click)="toggleNotifications()">
              Notifications
              @if (unreadCount()) { <span>{{ unreadCount() }}</span> }
            </button>
            @if (notificationsOpen()) {
              <div class="notification-menu">
                <div class="notification-head">
                  <strong>Notifications</strong>
                  <button type="button" (click)="markAllRead()">Mark all as read</button>
                </div>
                @for (notification of notifications(); track notification.id) {
                  <button class="notification-item" [class.unread]="!notification.read" type="button" (click)="openNotification(notification)">
                    <strong>{{ notification.title }}</strong>
                    <span>{{ notification.message }}</span>
                  </button>
                } @empty {
                  <p class="notification-empty">No notifications.</p>
                }
              </div>
            }
          </div>
        }
        @if (auth.isAdmin() && isPreview()) {
          <a routerLink="/admin">Back to Dashboard</a>
        } @else if (auth.isLoggedIn()) {
          <a routerLink="/profile">My Account</a>
          <a routerLink="/logout">Logout</a>
          <a routerLink="/cart" class="cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1" fill="#cbd5e1"/><circle cx="18" cy="20" r="1" fill="#cbd5e1"/></svg>
            <span class="cart-count">{{ cartCount() }}</span>
          </a>
        } @else {
          <a routerLink="/login" class="login">Login</a>
        }
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <!-- Mega navigation (categories) -->
    <div class="mega-nav" [class.open]="navOpen()" [class.closed]="!navOpen()">
      <div class="mega-inner">
        <button class="close-btn" type="button" (click)="toggleNav()">×</button>
        <h3>Categories</h3>
        <nav class="menu-list">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/products']" [queryParams]="{ categoryId: cat.id }" (click)="toggleNav()">{{ cat.name }}</a>
          }
        </nav>
      </div>
    </div>
    <div class="mega-overlay" *ngIf="navOpen()" (click)="toggleNav()"></div>

    <footer class="footer">
      <div>
        <strong>Sowar</strong>
        <span>Natural honey, organized orders, and clear shipping by governorate.</span>
      </div>
      <nav aria-label="Quick Links">
        <button class="footer-contact" type="button" (click)="toggleContact()">Contact</button>
        @if (auth.isAdmin() && !isPreview()) {
          <a routerLink="/admin">Dashboard</a>
        } @else {
          <a routerLink="/products">Products</a>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/orders">My Orders</a>
        }
      </nav>
    </footer>

    @if (contactOpen()) {
      <div class="contact-overlay" (click)="toggleContact()"></div>
      <section class="contact-modal" role="dialog" aria-label="Contact links">
        <div class="contact-head">
          <strong>Contact</strong>
          <button type="button" (click)="toggleContact()">x</button>
        </div>
        <div class="contact-list">
          @for (link of contactLinks(); track link.id || link.value) {
            <a [class]="'platform-' + (link.platform || 'LINK').toLowerCase()" [href]="contactHref(link)" target="_blank" rel="noopener">
              <strong>{{ contactLabel(link.platform) }}</strong>
            </a>
          } @empty {
            <p>No contact links yet.</p>
          }
        </div>
      </section>
    }

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
export class AppComponent implements OnInit {
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  notificationsOpen = signal(false);
  cartCount = signal(0);
  navOpen = signal(false);
  categories = signal<any[]>([]);
  contactOpen = signal(false);
  contactLinks = signal<ContactLink[]>([]);

  constructor(public auth: AuthService, public toast: ToastService, private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.loadNotifications();
    setInterval(() => this.loadNotifications(), 30000);
    this.loadCart();
    setInterval(() => this.loadCart(), 30000);
    // load categories for mega nav
    this.api.categories().subscribe(list => this.categories.set(list || []));
    this.api.contactLinks().subscribe(list => this.contactLinks.set(list || []));
  }

  loadCart() {
    this.api.cart().subscribe(cart => {
      const count = cart?.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
      this.cartCount.set(count);
    }, () => { this.cartCount.set(0); });
  }



  isPreview() {
    return this.router.url.startsWith('/preview');
  }

  toggleNotifications() {
    this.notificationsOpen.update(value => !value);
    if (this.notificationsOpen()) this.loadNotifications();
  }

  loadNotifications() {
    if (!this.auth.isLoggedIn()) return;
    this.api.notifications().subscribe(notifications => {
      this.notifications.set(notifications.slice(0, 8));
      this.unreadCount.set(notifications.filter(item => !item.read).length);
    });
  }

  markAllRead() {
    this.api.markAllNotificationsRead().subscribe(() => this.loadNotifications());
  }

  openNotification(notification: AppNotification) {
    this.api.markNotificationRead(notification.id).subscribe(() => this.loadNotifications());
    this.notificationsOpen.set(false);
    if (notification.targetUrl) this.router.navigateByUrl(notification.targetUrl);
  }

  toggleNav() {
    this.navOpen.update(v => !v);
  }

  toggleContact() {
    this.contactOpen.update(v => !v);
  }

  contactHref(link: ContactLink) {
    const platform = (link.platform || '').toUpperCase();
    const value = (link.value || '').trim();
    if (platform === 'WHATSAPP') return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    if (platform === 'EMAIL') return value.startsWith('mailto:') ? value : `mailto:${value}`;
    if (platform === 'PHONE') return value.startsWith('tel:') ? value : `tel:${value.replace(/\\s/g, '')}`;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `https://${value}`;
  }

  contactLabel(platform: string) {
    const labels: Record<string, string> = {
      INSTAGRAM: 'Instagram',
      FACEBOOK: 'Facebook',
      TIKTOK: 'TikTok',
      EMAIL: 'Email',
      WHATSAPP: 'WhatsApp',
      PHONE: 'Phone'
    };
    return labels[(platform || '').toUpperCase()] || 'Link';
  }
}
