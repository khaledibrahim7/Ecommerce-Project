import { Component, OnInit, signal, Inject, effect, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf, DOCUMENT } from '@angular/common';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ApiService } from './core/api.service';
import { AuthService } from './core/auth.service';
import { AppNotification, ContactLink } from './core/models';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, TranslatePipe],
  template: `
    @if (!isWelcomePage()) {
      <header class="topbar">
        <div class="brand-wrapper">
          <button class="menu-btn" type="button" aria-label="Menu" (click)="toggleNav()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a [routerLink]="auth.isAdmin() && !isPreview() ? '/admin' : '/home'" class="brand" aria-label="Sowar">
            <span class="brand-word">Sowar</span>
          </a>
        </div>

        <nav aria-label="Main Menu">
          @if (auth.isAdmin() && !isPreview()) {
            <a routerLink="/admin" routerLinkActive="active">{{ 'Dashboard' | translate }}</a>
            <a routerLink="/preview/products" routerLinkActive="active">{{ 'Preview Store' | translate }}</a>
          } @else {
            <a [routerLink]="isPreview() ? '/preview/products' : '/products'" routerLinkActive="active">{{ 'Products' | translate }}</a>
            @if (!isPreview()) {
              <a routerLink="/wishlist" routerLinkActive="active">{{ 'Wishlist' | translate }}</a>
              <a routerLink="/orders" routerLinkActive="active">{{ 'My Orders' | translate }}</a>
            }
          }
        </nav>

        <div class="actions">
          <!-- Language Switcher -->
          <div class="language-switcher-single">
            @if (translate.currentLang() === 'ar' || !translate.currentLang()) {
              <button type="button" class="lang-toggle-btn" (click)="switchLanguage('en')">EN</button>
            } @else {
              <button type="button" class="lang-toggle-btn" (click)="switchLanguage('ar')">AR</button>
            }
          </div>
          <!-- Theme Toggle Button -->
          <button class="theme-toggle" type="button" (click)="toggleTheme()" aria-label="Toggle Theme">
            @if (isDarkMode()) {
              <!-- Sun Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            } @else {
              <!-- Moon Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            }
          </button>

          @if (auth.isLoggedIn()) {
            <div class="notifications">
              <button class="notification-btn" type="button" (click)="toggleNotifications()" aria-label="Notifications" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                @if (unreadCount()) { <span class="notification-badge">{{ unreadCount() }}</span> }
              </button>
              @if (notificationsOpen()) {
                <div class="notification-menu">
                  <div class="notification-head">
                    <strong>{{ 'Notifications' | translate }}</strong>
                    <button type="button" (click)="markAllRead()">{{ 'Mark all as read' | translate }}</button>
                  </div>
                  @for (notification of notifications(); track notification.id) {
                    <button class="notification-item" [class.unread]="!notification.read" type="button" (click)="openNotification(notification)">
                      <strong>{{ notification.title }}</strong>
                      <span>{{ notification.message }}</span>
                    </button>
                  } @empty {
                    <p class="notification-empty">{{ 'No notifications.' | translate }}</p>
                  }
                </div>
              }
            </div>
          }
          @if (auth.isAdmin() && isPreview()) {
            <a routerLink="/admin" class="back-to-dashboard">{{ 'Back to Dashboard' | translate }}</a>
          } @else if (auth.isLoggedIn()) {
            @if (!isAdminPage()) {
              <a routerLink="/cart" class="cart" aria-label="Cart" title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></svg>
                <span class="cart-count">{{ cartCount() }}</span>
              </a>
            }
            <a routerLink="/profile" class="profile-btn" aria-label="My Account" title="My Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
            <a routerLink="/logout" class="logout-btn" aria-label="Logout" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </a>
          } @else {
            @if (!isLoginPage()) {
              <a routerLink="/login" class="login">{{ 'Login' | translate }}</a>
            }
          }
        </div>
      </header>
    }

    <main>
      <router-outlet />
    </main>

    <!-- Mega navigation (general menu) -->
    <div class="mega-nav" [class.open]="navOpen()" [class.closed]="!navOpen()">
      <div class="mega-inner">
        <button class="close-btn" type="button" (click)="toggleNav()">×</button>

        <h3>{{ 'Menu' | translate }}</h3>
        <nav class="menu-list">
          @if (auth.isAdmin() && !isPreview()) {
            <a routerLink="/admin" routerLinkActive="active" (click)="toggleNav()">{{ 'Dashboard' | translate }}</a>
            <a routerLink="/preview/products" routerLinkActive="active" (click)="toggleNav()">{{ 'Preview Store' | translate }}</a>
          } @else {
            <a [routerLink]="isPreview() ? '/preview/products' : '/products'" routerLinkActive="active" (click)="toggleNav()">{{ 'Products' | translate }}</a>
            @if (!isPreview()) {
              <a routerLink="/wishlist" routerLinkActive="active" (click)="toggleNav()">{{ 'Wishlist' | translate }}</a>
              <a routerLink="/orders" routerLinkActive="active" (click)="toggleNav()">{{ 'My Orders' | translate }}</a>
            }
          }
          @if (auth.isLoggedIn()) {
            <a routerLink="/profile" (click)="toggleNav()">{{ 'My Account' | translate }}</a>
            <a routerLink="/logout" (click)="toggleNav()">{{ 'Logout' | translate }}</a>
          } @else {
            <a routerLink="/login" (click)="toggleNav()">{{ 'Login' | translate }}</a>
          }
        </nav>

        <h3>{{ 'Quick Support' | translate }}</h3>
        <nav class="menu-list">
          <a href="javascript:void(0)" (click)="toggleNav(); toggleContact()">{{ 'Contact Us' | translate }}</a>
        </nav>
      </div>
    </div>
    <div class="mega-overlay" *ngIf="navOpen()" (click)="toggleNav()"></div>

    @if (!isWelcomePage()) {
    <footer class="footer">
      <div class="footer-grid">
        <!-- Column 1: Brand & Description -->
        <div class="footer-column brand-col">
          <strong class="footer-logo">Sowar</strong>
          <p class="footer-desc">{{ 'Sowar Natural Honey Description' | translate }}</p>
          <div class="footer-socials">
            <button class="social-btn" (click)="toggleContact()" aria-label="Support">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>{{ 'Contact Us' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- Column 2: Quick Links -->
        <div class="footer-column">
          <h4>{{ 'Shop' | translate }}</h4>
          <ul class="footer-links">
            <li><a routerLink="/products">{{ 'Products' | translate }}</a></li>
            @if (!isPreview()) {
              <li><a routerLink="/cart">{{ 'Shopping Cart' | translate }}</a></li>
              <li><a routerLink="/wishlist">{{ 'Wishlist' | translate }}</a></li>
            }
          </ul>
        </div>

        <!-- Column 3: My Account / Support -->
        <div class="footer-column">
          <h4>{{ 'My Account' | translate }}</h4>
          <ul class="footer-links">
            @if (auth.isAdmin() && !isPreview()) {
              <li><a routerLink="/admin">{{ 'Dashboard' | translate }}</a></li>
            } @else {
              @if (auth.isLoggedIn()) {
                <li><a routerLink="/profile">{{ 'Personal Profile' | translate }}</a></li>
                <li><a routerLink="/orders">{{ 'My Orders' | translate }}</a></li>
                <li><a routerLink="/logout">{{ 'Logout' | translate }}</a></li>
              } @else {
                <li><a routerLink="/login">{{ 'Login' | translate }}</a></li>
                <li><a routerLink="/register">{{ 'Create Account' | translate }}</a></li>
              }
            }
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">{{ 'Copyright © 2026 Sowar. All rights reserved.' | translate }}</p>
      </div>
    </footer>
    }

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
  isDarkMode = signal<boolean>(localStorage.getItem('sowar_dark_mode') === 'true');
  isWelcomePage = signal<boolean>(false);

  constructor(
    public auth: AuthService,
    public toast: ToastService,
    private router: Router,
    private api: ApiService,
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.translate.addLangs(['en', 'ar']);
    const savedLang = localStorage.getItem('sowar_lang') || 'ar';
    this.translate.use(savedLang);
    this.document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = savedLang;
    // React to auth status changes (login/logout)
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.loadCart();
        this.loadNotifications();
      } else {
        this.cartCount.set(0);
        this.unreadCount.set(0);
        this.notifications.set([]);
      }
    });
  }

  ngOnInit() {
    this.updateWelcomeStatus();
    this.applyTheme();
    this.router.events.subscribe(() => {
      this.applyTheme();
      this.updateWelcomeStatus();
    });

    // Subscribe to cart updates
    this.api.cartUpdated$.subscribe(() => {
      this.loadCart();
    });

    // Subscribe to contact links updates
    this.api.contactLinksUpdated$.subscribe(() => {
      this.api.contactLinks().subscribe(list => this.contactLinks.set(list || []));
    });

    setInterval(() => this.loadNotifications(), 30000);
    setInterval(() => this.loadCart(), 30000);
    // load categories for mega nav
    this.api.categories().subscribe(list => this.categories.set(list || []));
    this.api.contactLinks().subscribe(list => this.contactLinks.set(list || []));
  }

  updateWelcomeStatus() {
    this.isWelcomePage.set(this.router.url === '/' || this.router.url === '');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('sowar_lang', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.dir = dir;
    this.document.documentElement.lang = language;
  }

  toggleTheme() {
    this.isDarkMode.update(v => {
      const newVal = !v;
      localStorage.setItem('sowar_dark_mode', String(newVal));
      return newVal;
    });
    this.applyTheme();
  }

  applyTheme() {
    const body = this.document.body;
    body.classList.remove('dark-theme', 'admin-theme');
    if (this.isDarkMode()) {
      body.classList.add('dark-theme');
    }
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

  isAdminPage() {
    return this.router.url.startsWith('/admin');
  }

  toggleNotifications() {
    this.notificationsOpen.update(value => !value);
    if (this.notificationsOpen()) this.loadNotifications();
  }

  loadNotifications() {
    if (!this.auth.isLoggedIn()) return;
    this.api.notifications().subscribe(notifications => {
      const unread = notifications.filter(item => !item.read);
      this.notifications.set(unread.slice(0, 8));
      this.unreadCount.set(unread.length);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications')) {
      this.notificationsOpen.set(false);
    }
  }

  toggleNav() {
    this.navOpen.update(v => !v);
  }

  toggleContact() {
    this.contactOpen.update(v => !v);
  }

  isLoginPage() {
    return this.router.url.startsWith('/login');
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
