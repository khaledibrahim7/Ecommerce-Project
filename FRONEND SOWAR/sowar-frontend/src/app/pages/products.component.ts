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
          <h1>Products</h1>
          <p class="muted">Search, filter, and sort Sowar products.</p>
        </div>
      </div>
      <div class="shop-layout">
        <aside class="card filter-panel" [class.open]="filtersOpen()" [class.closed]="!filtersOpen()">
          <div class="filter-head">
            <strong>Categories & Filters</strong>
            <button class="btn ghost" type="button" (click)="toggleFilters()">@if(filtersOpen()) { Close } @else { Open }</button>
          </div>

          <div class="filter-controls">
            <label>Sort By
              <select [(ngModel)]="sort" (change)="page = 0; load()">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </label>
            <button class="btn secondary" type="button" (click)="resetFilters()">Clear Filters</button>
            <button class="btn ghost" type="button" (click)="toggleCategoriesCustomizer()">Customize Categories</button>
          </div>
        </aside>

        <div class="products-area">
          <!-- Filters sidebar visible on desktop; on mobile use the Filters button in header or open via UI -->
          <div class="top-categories">
            <div class="chips">
              @for (cat of categories(); track cat.id) {
                @if (selectedCategoryIds().includes(cat.id)) {
                  <button class="chip" [class.active]="categoryId === cat.id" type="button" (click)="categoryId = cat.id; page = 0; load()">{{ cat.name }}</button>
                }
              }
            </div>
          </div>

          @if(showCategoriesCustomizer()) {
            <div class="categories-customizer card">
              <strong>Choose categories to display</strong>
              <div class="custom-list">
                @for (cat of categories(); track cat.id) {
                  <label class="custom-item">
                    <input type="checkbox" [checked]="selectedCategoryIds().includes(cat.id)" (change)="toggleSelectedCategory(cat.id)" />
                    {{ cat.name }}
                  </label>
                }
              </div>
              <div class="custom-actions">
                <button class="btn secondary" type="button" (click)="clearSelectedCategories()">Clear</button>
                <button class="btn" type="button" (click)="closeCategoriesCustomizer()">Done</button>
              </div>
            </div>
          }

          <div class="search-card card">
            <input placeholder="Search by product name" [(ngModel)]="q" (input)="page = 0; load()">
          </div>

          <div class="grid products-grid">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="addWishlist($event)" />
            } @empty {
              <div class="card empty">No products match your search.</div>
            }
          </div>
        </div>
      </div>
      <div class="pager">
        <button class="btn secondary" [disabled]="page === 0" (click)="page = page - 1; load()">Previous</button>
        <span>Page {{ page + 1 }} of {{ totalPages() || 1 }}</span>
        <button class="btn secondary" [disabled]="page + 1 >= totalPages()" (click)="page = page + 1; load()">Next</button>
      </div>
    </section>
  `,
  styles: [`
    .shop-layout { display: grid; gap: 18px; align-items: start; grid-template-columns: 260px 1fr; }
    .filter-panel { padding: 14px; display: flex; flex-direction: column; gap: 12px; background: var(--bg-card); border: 1px solid var(--border-color); }
    .filter-head { display:flex; justify-content: space-between; align-items: center; gap: 8px; }
    .categories-list { display: grid; gap: 8px; }
    .cat-item { text-align: start; padding: 8px 10px; border-radius: 6px; background: transparent; color: var(--text-primary); border: 0; cursor: pointer; }
    .cat-item.active { background: rgba(14,165,164,0.12); color: var(--accent-primary); font-weight: 600; }
    .filter-controls { display: grid; gap: 8px; }
    .products-area { display: grid; gap: 18px; }
    .top-categories { padding: 6px 0; }
    .chips { display:flex; gap:10px; overflow:auto; padding-bottom:6px; }
    .chip { white-space:nowrap; padding:8px 12px; border-radius:20px; border:1px solid transparent; background: rgba(255,255,255,0.02); color: var(--text-primary); cursor: pointer; }
    .chip.active { background: var(--accent-primary); color: #042025; box-shadow: var(--shadow-sm); font-weight:600; }
    .search-card { padding: 12px; background: var(--bg-card); border:1px solid var(--border-color); }
    .products-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); align-items: start; display: grid; gap: 1.5rem; }
    .pager { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
    /* Off-canvas behavior for mobile */
    .filter-panel { transition: transform 0.28s ease, visibility 0.28s; }
    .filter-panel.closed { transform: translateX(-100%); visibility: hidden; position: fixed; left: 0; top: 0; bottom: 0; width: 320px; z-index: 9999; }
    .filter-panel.open { transform: translateX(0); visibility: visible; position: fixed; left: 0; top: 0; bottom: 0; width: 320px; z-index: 9999; background: var(--bg-card); padding: 18px; box-shadow: var(--shadow-lg); }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; }
    .show-filters { display: none; }
    /* floating-open-filters removed */

    @media (max-width: 1100px) {
      .shop-layout { grid-template-columns: 1fr; }
      .filter-panel { order: 2; }
      .filter-panel.closed { transform: translateX(-100%); }
      .filter-panel.open { transform: translateX(0); }
      .show-filters { display: inline-flex; margin-bottom: 6px; }
      .products-area { order: 1; }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  // which category chips are visible (user-customizable)
  selectedCategoryIds = signal<number[]>([]);
  showCategoriesCustomizer = signal(false);
  totalPages = signal(0);
  q = '';
  categoryId?: number;
  sort = 'featured';
  page = 0;
  filtersOpen = signal(true);

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.categories().subscribe(data => {
      this.categories.set(data);
      this.selectedCategoryIds.set(data.slice(0, 6).map((c: Category) => c.id));
    });
    this.load();
  }

  toggleCategoriesCustomizer() {
    this.showCategoriesCustomizer.update(v => !v);
  }

  toggleSelectedCategory(id: number) {
    const current = this.selectedCategoryIds();
    if (current.includes(id)) {
      this.selectedCategoryIds.set(current.filter(x => x !== id));
    } else {
      this.selectedCategoryIds.set([...current, id]);
    }
  }

  toggleFilters() {
    this.filtersOpen.update(v => !v);
  }

  clearSelectedCategories() {
    this.selectedCategoryIds.set([]);
  }

  closeCategoriesCustomizer() {
    this.showCategoriesCustomizer.set(false);
  }

  load() {
    this.api.products({ q: this.q, categoryId: this.categoryId, sort: this.sort, page: this.page, size: 12 })
      .subscribe(result => { this.products.set(result.content); this.totalPages.set(result.totalPages); });
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, 1).subscribe(() => this.toast.success('Product added to cart'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('Product added to wishlist'));
  }

  resetFilters() {
    this.q = '';
    this.categoryId = undefined;
    this.sort = 'featured';
    this.page = 0;
    this.load();
  }
}
