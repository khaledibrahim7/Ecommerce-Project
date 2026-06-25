import { Component, OnInit, signal, HostListener } from '@angular/core';
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
      <!-- Luxury Banner Header -->
      <div class="products-header">
        <div class="header-content">
          <span class="category-pre">Organic Boutique</span>
          <h1>Our Pure Honey Collections</h1>
          <p>100% natural, raw, and unpasteurized honey directly from local apiaries.</p>
        </div>
      </div>

      <!-- Glassmorphic Filter Controls -->
      <div class="filter-wrapper">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search products..." [(ngModel)]="q" (input)="page = 0; load()">
        </div>
        
        <div class="filter-controls">
          <!-- Premium Category Dropdown -->
          <div class="category-dropdown-wrapper">
            <button class="dropdown-btn" (click)="toggleCategoryMenu($event)" type="button">
              <span>{{ getCategoryLabel() }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon" [class.open]="categoryMenuOpen()">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            @if (categoryMenuOpen()) {
              <div class="dropdown-menu">
                <button class="dropdown-item" [class.active]="categoryId === undefined" (click)="selectCategory(undefined)" type="button">
                  All Products
                </button>
                @for (cat of categories(); track cat.id) {
                  <button class="dropdown-item" [class.active]="categoryId === cat.id" (click)="selectCategory(cat.id)" type="button">
                    {{ cat.name }}
                  </button>
                }
              </div>
            }
          </div>

          <div class="select-wrapper">
            <select [(ngModel)]="sort" (change)="page = 0; load()">
              <option value="featured">Featured</option>
              <option value="newest">Newest Products</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
          
          <button class="btn-reset" (click)="resetFilters()" aria-label="Reset Filters" title="Reset Filters">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid products-grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="addWishlist($event)" />
        } @empty {
          <div class="empty-state">
            <div class="empty-icon">🍯</div>
            <h3>No Products Found</h3>
            <p>We couldn't find any products matching your search criteria. Try adjusting your filters or search term.</p>
            <button class="btn btn-primary" (click)="resetFilters()">Clear Filters</button>
          </div>
        }
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="page-btn prev" [disabled]="page === 0" (click)="page = page - 1; load()" aria-label="Previous Page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="page-indicator">Page {{ page + 1 }} of {{ totalPages() || 1 }}</span>
        <button class="page-btn next" [disabled]="page + 1 >= totalPages()" (click)="page = page + 1; load()" aria-label="Next Page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .products-header {
      position: relative;
      padding: var(--spacing-3xl) clamp(16px, 6vw, 60px);
      margin-bottom: var(--spacing-2xl);
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, rgba(12, 9, 6, 0.5) 0%, rgba(12, 9, 6, 0.2) 100%),
                  url('/sowar-honey-banner.png') center/cover;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 180px;
    }
    
    .header-content {
      position: relative;
      z-index: 2;
      max-width: 600px;
      text-align: start;
    }
    
    .header-content .category-pre {
      color: var(--accent-primary);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: block;
      margin-bottom: 8px;
    }
    
    .header-content h1 {
      margin: 0 0 8px 0;
      font-family: var(--font-title);
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      color: #ffffff;
      font-weight: 800;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    
    .header-content p {
      margin: 0;
      color: #eae0d5;
      font-size: 1rem;
      line-height: 1.5;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    
    .category-dropdown-wrapper {
      position: relative;
    }
    
    .dropdown-btn {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: var(--bg-base);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      padding: 11px 18px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      min-width: 145px;
    }
    
    .dropdown-btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      box-shadow: 0 4px 10px rgba(212, 163, 92, 0.05);
    }
    
    .dropdown-btn .arrow-icon {
      transition: transform var(--transition-fast);
    }
    
    .dropdown-btn .arrow-icon.open {
      transform: rotate(180deg);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      margin-top: 8px;
      inset-inline-start: 0;
      min-width: 200px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 100;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
    }
    
    .dropdown-item {
      width: 100%;
      text-align: start;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .dropdown-item:hover {
      background: rgba(212, 163, 92, 0.1);
      color: var(--accent-primary);
    }
    
    .dropdown-item.active {
      background: var(--accent-primary);
      color: var(--bg-base);
    }
    
    .filter-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      margin-bottom: 32px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
    }
    
    .search-box {
      position: relative;
      flex-grow: 1;
      max-width: 400px;
      min-width: 240px;
    }
    
    .search-box .search-icon {
      position: absolute;
      inset-inline-start: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }
    
    .search-box input {
      width: 100%;
      padding-block: 11px;
      padding-inline-start: 40px;
      padding-inline-end: 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-base);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      outline: none;
      box-sizing: border-box;
    }
    
    .search-box input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(212, 163, 92, 0.15);
    }
    
    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .select-wrapper {
      position: relative;
    }
    
    .select-wrapper select {
      padding-block: 11px;
      padding-inline-start: 16px;
      padding-inline-end: 36px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-base);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      box-sizing: border-box;
    }
    
    .select-wrapper select:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(212, 163, 92, 0.15);
    }
    
    .select-wrapper::after {
      content: '';
      position: absolute;
      inset-inline-end: 14px;
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-top-color: var(--text-secondary);
      pointer-events: none;
    }
    
    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      padding: 11px 18px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .btn-reset:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: rgba(212, 163, 92, 0.05);
      transform: translateY(-1px);
    }
    
    .btn-reset svg {
      transition: transform var(--transition-fast);
    }
    
    .btn-reset:hover svg {
      transform: rotate(-180deg);
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 60px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      gap: 16px;
    }
    
    .empty-state .empty-icon {
      font-size: 3.5rem;
      animation: pulse 2s infinite ease-in-out;
    }
    
    .empty-state h3 {
      margin: 0;
      font-family: var(--font-title);
      font-size: 1.5rem;
      color: var(--text-primary);
    }
    
    .empty-state p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 400px;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    
    .empty-state .btn-primary {
      margin-top: 8px;
      padding: 12px 28px;
      background: var(--accent-primary);
      color: var(--bg-base);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 14px rgba(212, 163, 92, 0.3);
    }
    
    .empty-state .btn-primary:hover {
      background: var(--accent-secondary);
      transform: translateY(-2px);
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
      padding: 16px 0;
    }
    
    .page-btn {
      width: 40px;
      height: 40px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .page-btn:hover:not(:disabled) {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: var(--bg-secondary);
      transform: translateY(-1px);
    }
    
    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .page-indicator {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
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

  categoryMenuOpen = signal(false);

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.categories().subscribe(data => {
      this.categories.set(data);
    });
    this.load();
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

  toggleCategoryMenu(event: MouseEvent) {
    event.stopPropagation();
    this.categoryMenuOpen.update(o => !o);
  }

  selectCategory(id?: number) {
    this.categoryId = id;
    this.categoryMenuOpen.set(false);
    this.page = 0;
    this.load();
  }

  getCategoryLabel(): string {
    if (this.categoryId === undefined) {
      return 'Categories';
    }
    const cat = this.categories().find(c => c.id === this.categoryId);
    return cat ? cat.name : 'Categories';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-dropdown-wrapper')) {
      this.categoryMenuOpen.set(false);
    }
  }

  setCategory(id?: number) {
    this.selectCategory(id);
  }

  resetFilters() {
    this.q = '';
    this.categoryId = undefined;
    this.categoryMenuOpen.set(false);
    this.sort = 'featured';
    this.page = 0;
    this.load();
  }
}
