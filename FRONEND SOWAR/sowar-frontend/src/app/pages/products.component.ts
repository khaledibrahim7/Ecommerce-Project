import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Category, Product } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  imports: [FormsModule, ProductCardComponent],
  template: `
    <section class="page">
      <div class="section-title">
        <div>
          <h1>المنتجات</h1>
          <p class="muted">ابحث، فلتر، ورتب منتجات سوار.</p>
        </div>
      </div>
      <div class="shop-layout">
        <aside class="card filter-panel">
          <label>التصنيفات
            <select [(ngModel)]="categoryId" (change)="page = 0; load()">
              <option [ngValue]="undefined">كل التصنيفات</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>
          <label>المميز والترتيب
            <select [(ngModel)]="sort" (change)="page = 0; load()">
              <option value="featured">المميز</option>
              <option value="newest">الأحدث</option>
              <option value="priceAsc">الأقل سعرا</option>
              <option value="priceDesc">الأعلى سعرا</option>
            </select>
          </label>
          <button class="btn secondary" type="button" (click)="resetFilters()">مسح الفلاتر</button>
        </aside>

        <div class="products-area">
          <div class="search-card card">
            <input placeholder="بحث باسم المنتج" [(ngModel)]="q" (input)="page = 0; load()">
          </div>
          <div class="grid products-grid">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="addWishlist($event)" />
            } @empty {
              <div class="card empty">لا توجد منتجات مطابقة للبحث.</div>
            }
          </div>
        </div>
      </div>
      <div class="pager">
        <button class="btn secondary" [disabled]="page === 0" (click)="page = page - 1; load()">السابق</button>
        <span>صفحة {{ page + 1 }} من {{ totalPages() || 1 }}</span>
        <button class="btn secondary" [disabled]="page + 1 >= totalPages()" (click)="page = page + 1; load()">التالي</button>
      </div>
    </section>
  `,
  styles: [`
    .shop-layout { display: grid; gap: 18px; align-items: start; }
    .filter-panel { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr); gap: 12px; padding: 14px; }
    .filter-panel .btn { align-self: end; }
    .products-area { display: grid; gap: 18px; }
    .search-card { padding: 12px; }
    .products-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); align-items: start; }
    .pager { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
    @media (max-width: 900px) {
      .shop-layout { grid-template-columns: 1fr; }
      .filter-panel { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  totalPages = signal(0);
  q = '';
  categoryId?: number;
  sort = 'featured';
  page = 0;

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.categories().subscribe(data => this.categories.set(data));
    this.load();
  }

  load() {
    this.api.products({ q: this.q, categoryId: this.categoryId, sort: this.sort, page: this.page, size: 12 })
      .subscribe(result => { this.products.set(result.content); this.totalPages.set(result.totalPages); });
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, 1).subscribe(() => this.toast.success('تمت إضافة المنتج للسلة'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('تمت إضافة المنتج للمفضلة'));
  }

  resetFilters() {
    this.q = '';
    this.categoryId = undefined;
    this.sort = 'featured';
    this.page = 0;
    this.load();
  }
}
