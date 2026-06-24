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
    <section class="hero">
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
    .hero {
      min-height: 480px;
      display: grid;
      align-items: center;
      padding: 2rem;
      color: var(--text-primary);
      background: linear-gradient(90deg, rgba(3,6,10,0.6), rgba(3,6,10,0.25)), url('https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1600&q=80') center/cover;
      border-radius: 0 0 20px 20px;
      margin-bottom: 3rem;
    }
    .hero-content {
      max-width: 650px;
      display: grid;
      gap: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .hero h1 {
      margin: 0;
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700;
      line-height: 1.1;
    }
    .hero p {
      margin: 0;
      font-size: 1.15rem;
      max-width: 90%;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }
    .btn {
      padding: 0.8rem 1.8rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .btn-primary {
      background-color: var(--accent-primary);
      color: #042025;
      border: 1px solid rgba(14,165,164,0.15);
    }
    .btn-primary:hover {
      filter: brightness(1.05);
      box-shadow: var(--shadow-md);
    }
    .btn-secondary {
      background-color: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.5);
    }
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.2);
    }

    .featured-products {
      padding-bottom: 3rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .section-header h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .view-all-link {
      color: var(--accent-secondary);
      text-decoration: none;
      font-weight: 500;
    }
    .view-all-link:hover {
      text-decoration: underline;
      color: var(--accent-primary);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
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
