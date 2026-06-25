import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Product } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  imports: [RouterLink, ProductCardComponent],
  template: `
    <section class="hero" style="background-image: linear-gradient(to right, rgba(12, 9, 6, 0.2) 0%, rgba(12, 9, 6, 0.7) 100%), url('/user-honey.jpg'); background-size: cover; background-position: center;">
      <div class="hero-content">
        <h1>Sowar Natural Honey</h1>
        <p>Discover the purity of nature in every spoonful. Our authentic honey products offer a unique experience of quality and unforgettable taste.</p>
        <div class="hero-actions">
          <a routerLink="/products" class="btn btn-primary">Shop Now</a>
          @if (!isLoggedIn) {
            <a routerLink="/register" class="btn btn-secondary">Create Account</a>
          }
        </div>
      </div>
    </section>

    <section class="page featured-products">
      <div class="section-header">
        <h2>Featured Products</h2>
        <a routerLink="/products" class="view-all-link">View All</a>
      </div>
      <div class="grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="addWishlist($event)" />
        }
      </div>
    </section>
  `,
  styles: [`
    @keyframes hero-entry {
      from {
        transform: scale(1.03);
        opacity: 0.8;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    .hero {
      position: relative;
      min-height: 520px;
      display: flex;
      align-items: center;
      padding: var(--spacing-3xl) clamp(16px, 6vw, 80px);
      margin-bottom: var(--spacing-3xl);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      animation: hero-entry 1.2s ease-out;
    }
    .hero-content {
      max-width: 600px;
      background: rgba(12, 9, 6, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: var(--spacing-2xl);
      border-radius: var(--radius-md);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      display: grid;
      gap: 16px;
      animation: fadeIn var(--transition-slow);
    }
    .hero h1 {
      margin: 0;
      font-family: var(--font-title);
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      line-height: 1.15;
    }
    .hero p {
      margin: 0;
      font-size: 1.1rem;
      color: #eae0d5;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
      line-height: 1.7;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .btn {
      padding: 12px 28px;
      border-radius: var(--radius-md);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all var(--transition-base);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .btn-primary {
      background-color: var(--accent-primary);
      color: #0c0906;
      box-shadow: 0 4px 14px rgba(212, 163, 92, 0.3);
    }
    .btn-primary:hover {
      background-color: var(--accent-secondary);
      transform: translateY(-2px);
    }
    .btn-secondary {
      background-color: transparent;
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.7);
    }
    .btn-secondary:hover {
      background-color: #ffffff;
      color: #0c0906;
      border-color: #ffffff;
      transform: translateY(-2px);
    }

    .featured-products {
      padding-bottom: var(--spacing-4xl);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--spacing-sm);
    }
    .section-header h2 {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .view-all-link {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: color var(--transition-fast);
    }
    .view-all-link:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-xl);
    }
  `]
})
export class HomeComponent implements OnInit {
  products = signal<Product[]>([]);
  isLoggedIn = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  ngOnInit() {
    this.api.products({ featured: true, size: 8 }).subscribe(page => this.products.set(page.content));
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, 1).subscribe(() => this.toast.success('Product added to cart'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('Product added to wishlist'));
  }
}
