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
      <div>
        <p>عسل طبيعي مختار بعناية</p>
        <h1>سوار</h1>
        <span>منتجات عسل أصلية، عروض واضحة، وتوصيل حسب محافظتك.</span>
        <div>
          <a routerLink="/products" class="btn">تسوق الآن</a>
          <a routerLink="/register" class="btn secondary">إنشاء حساب</a>
        </div>
      </div>
    </section>

    <section class="page">
      <div class="section-title">
        <h2>منتجات مميزة</h2>
        <a routerLink="/products">كل المنتجات</a>
      </div>
      <div class="grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="addWishlist($event)" />
        }
      </div>
    </section>
  `,
  styles: [`
    .hero { min-height: 520px; display: grid; align-items: end; padding: clamp(24px, 5vw, 56px); color: #fff; background: linear-gradient(90deg, rgba(36,23,10,.9), rgba(36,23,10,.34)), url('https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1600&q=80') center/cover; }
    .hero > div { max-width: 620px; display: grid; gap: 16px; }
    h1 { margin: 0; font-size: clamp(3rem, 9vw, 7rem); line-height: .95; }
    p, span { margin: 0; font-size: 1.15rem; }
    .hero div div { display: flex; gap: 10px; flex-wrap: wrap; }
  `]
})
export class HomeComponent implements OnInit {
  products = signal<Product[]>([]);

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.products({ featured: true, size: 8 }).subscribe(page => this.products.set(page.content));
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, 1).subscribe(() => this.toast.success('تمت إضافة المنتج للسلة'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('تمت إضافة المنتج للمفضلة'));
  }
}
