import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Product } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page admin-products">
      <div class="section-title">
        <div>
          <h1>Product Management</h1>
          <p class="muted">Add and edit products, images, and offers from a dedicated page.</p>
        </div>
        <div class="actions-row">
          <a class="btn secondary" routerLink="/admin">Dashboard</a>
          <a class="btn" routerLink="/products">Preview Store</a>
        </div>
      </div>

      <section class="card panel">
        <h2>{{ productForm.id ? 'Edit Product' : 'Add Product' }}</h2>
        <h3>Basic Information</h3>
        <div class="form-grid">
          <label>Product Name <input [(ngModel)]="productForm.name"></label>
          <label>Category
            <select [(ngModel)]="productForm.categoryId">
              <option [ngValue]="undefined">Select Category</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>
          <label>Price for Customer <input type="number" [(ngModel)]="productForm.price" (ngModelChange)="onPriceChange()"></label>
          <label>Product Cost <input type="number" [(ngModel)]="productForm.cost"></label>
          <label>Stock <input type="number" [(ngModel)]="productForm.stockQuantity"></label>
          <label>Low Stock Threshold <input type="number" [(ngModel)]="productForm.lowStockThreshold"></label>
          <label>Weight <input [(ngModel)]="productForm.weight"></label>
          <label>Origin <input [(ngModel)]="productForm.origin"></label>
          <label class="check"><input type="checkbox" [(ngModel)]="productForm.featured"> Featured on Homepage</label>
          <label class="check"><input type="checkbox" [(ngModel)]="productForm.active"> Visible to Customers</label>
          <label class="full">Description <textarea [(ngModel)]="productForm.description"></textarea></label>
          <label class="full">Ingredients <textarea [(ngModel)]="productForm.ingredients"></textarea></label>
          <label class="full">Usage Instructions <textarea [(ngModel)]="productForm.usageInstructions"></textarea></label>
          <label class="full">Storage Instructions <textarea [(ngModel)]="productForm.storageInstructions"></textarea></label>
        </div>

        <h3>Images</h3>
        <label class="upload-box">
          Add product images
          <input type="file" accept="image/*" multiple (change)="uploadProductImages($event)">
        </label>
        @if ((productForm.imageUrls || []).length) {
          <div class="image-list">
            @for (image of productForm.imageUrls; track image) {
              <div class="image-chip">
                <img [src]="imageUrl(image)" alt="Product Image">
                <button class="btn danger" type="button" (click)="removeImage(image)">Delete</button>
              </div>
            }
          </div>
        }

        <h3>Offer</h3>
        <div class="form-grid">
          <label>Offer Type
            <select [(ngModel)]="productForm.promotionType" (ngModelChange)="onPromotionChange()">
              <option value="NONE">No Offer</option>
              <option value="DISCOUNT">Price Discount</option>
              <option value="GIFT_PRODUCT">Gift Product</option>
            </select>
          </label>
           @if (productForm.promotionType === 'DISCOUNT') {
             <label>Price Before Discount <input type="number" [(ngModel)]="productForm.originalPrice" (ngModelChange)="onOriginalPriceChange()"></label>
             <label>Discount Percent % <input type="number" min="0" max="100" [(ngModel)]="productForm.discountPercent" (ngModelChange)="onDiscountPercentChange()" placeholder="e.g., 15"></label>
             <label>Offer Title <input [(ngModel)]="productForm.promotionTitle" placeholder="e.g., 15% Off"></label>
             <label class="full">Offer Description <textarea [(ngModel)]="productForm.promotionDescription"></textarea></label>
           }
          @if (productForm.promotionType === 'GIFT_PRODUCT') {
            <label>Gift Product
              <select [(ngModel)]="productForm.giftProductId">
                <option [ngValue]="undefined">Select Gift Product</option>
                @for (product of products(); track product.id) {
                  @if (product.id !== productForm.id) {
                    <option [ngValue]="product.id">{{ product.name }}</option>
                  }
                }
              </select>
            </label>
            <label>Gift Quantity <input type="number" min="1" [(ngModel)]="productForm.giftQuantity"></label>
            <label>Offer Title <input [(ngModel)]="productForm.promotionTitle" placeholder="e.g., Buy One Get One Free"></label>
            <label class="full">Offer Description <textarea [(ngModel)]="productForm.promotionDescription"></textarea></label>
          }
        </div>

        <div class="actions-row">
          <button class="btn" (click)="saveProduct()">Save Product</button>
          <button class="btn secondary" (click)="resetProduct()">{{ productForm.id ? 'Cancel Edit' : 'New Product' }}</button>
        </div>
      </section>

      <section class="card panel">
        <h2>Product List</h2>
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <img [src]="imageUrl(product.imageUrls?.[0] || '')" alt="{{ product.name }}" class="product-image">
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p>{{ product.categoryName || '-' }}</p>
                <div class="prices">
                  @if (showOldPrice(product)) {
                    <span class="old-price">{{ money(product.originalPrice) }}</span>
                  }
                  <strong>{{ money(product.price) }}</strong>
                </div>
                <p>Cost: {{ money(product.cost) }}</p>
                <p>Stock: {{ product.stockQuantity }}</p>
                <p>Offer: {{ offerLabel(product) }}</p>
                <p>Status: <span class="pill" [class.warn]="product.lowStock">{{ product.active ? 'Visible' : 'Disabled' }}</span></p>
              </div>
              <div class="product-actions">
                <button class="btn secondary" (click)="edit(product)">Edit</button>
                <button class="btn danger" (click)="deleteProduct(product.id)">Disable</button>
              </div>
            </div>
          } @empty {
            <p>No products found.</p>
          }
        </div>
      </section>
    </section>
  `,
  styles: [`
    .admin-products { display: grid; gap: 16px; }
    .panel { padding: 20px; overflow-x: auto; }
    .panel h2 { margin-top: 0; }
    h3 { margin: 18px 0 10px; color: #4a3420; }
    .actions-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .upload-box { display: grid; gap: 8px; padding: 14px; border: 1px dashed #c88a24; border-radius: 8px; background: #fffaf2; color: #4a3420; font-weight: 800; cursor: pointer; }
    .image-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; }
    .image-chip { display: grid; gap: 6px; padding: 8px; border: 1px solid #eadfca; border-radius: 8px; background: #fff; }
    .image-chip img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; }
    .pill { display: inline-flex; padding: 5px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; }
    .pill.warn { background: #fef3c7; color: #92400e; }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .product-card {
      border: 1px solid #eadfca;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      background: #fff;
    }
    .product-image {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .product-info {
      flex-grow: 1;
    }
    .product-info h3 {
      margin: 0 0 8px;
      font-size: 1.1rem;
    }
    .product-info p {
      margin: 4px 0;
      color: #555;
    }
    .prices {
      display: flex;
      gap: 8px;
      align-items: baseline;
      font-size: 1.1rem;
    }
    .old-price {
      text-decoration: line-through;
      color: #999;
      font-size: 0.9rem;
    }
    .product-actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  productForm: Partial<Product> = this.emptyProduct();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.adminProducts().subscribe(products => this.products.set(products));
    this.api.categories().subscribe(categories => this.categories.set(categories));
  }

  saveProduct() {
    this.api.saveProduct(this.prepareProductPayload()).subscribe(() => {
      this.toast.success('Product saved');
      this.resetProduct();
      this.load();
    });
  }

  uploadProductImages(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    files.forEach(file => {
      this.api.uploadImage(file).subscribe(result => {
        this.productForm.imageUrls = [...(this.productForm.imageUrls || []), result.url];
        this.toast.success('Image uploaded');
      });
    });
    (event.target as HTMLInputElement).value = '';
  }

  removeImage(image: string) {
    this.productForm.imageUrls = (this.productForm.imageUrls || []).filter(item => item !== image);
  }

  onPromotionChange() {
    if (this.productForm.promotionType === 'NONE') {
      this.productForm.originalPrice = undefined;
      this.productForm.promotionTitle = '';
      this.productForm.promotionDescription = '';
      this.productForm.giftProductId = undefined;
      this.productForm.giftQuantity = undefined;
      this.productForm.discountPercent = undefined;
    }
    if (this.productForm.promotionType === 'DISCOUNT') {
      this.productForm.giftProductId = undefined;
      this.productForm.giftQuantity = undefined;
    }
    if (this.productForm.promotionType === 'GIFT_PRODUCT') {
      this.productForm.originalPrice = undefined;
    }
  }

  // when admin edits the original (pre-discount) price, recalculate the displayed price if discountPercent exists
  onOriginalPriceChange() {
    const op = Number(this.productForm.originalPrice || 0);
    const pct = Number(this.productForm.discountPercent || 0);
    if (op > 0 && pct > 0) {
      const discounted = Math.round(op * (1 - pct / 100));
      this.productForm.price = discounted;
    }
  }

  // when admin edits the discount percent, recalc price/originalPrice to stay consistent
  onDiscountPercentChange() {
    const pct = Number(this.productForm.discountPercent || 0);
    const op = Number(this.productForm.originalPrice || 0);
    const p = Number(this.productForm.price || 0);
    if (op > 0 && pct > 0) {
      this.productForm.price = Math.round(op * (1 - pct / 100));
    } else if (p > 0 && pct > 0) {
      // if originalPrice missing but price exists, compute originalPrice from price
      this.productForm.originalPrice = Math.round(p / (1 - pct / 100));
    }
  }

  // if admin changes the displayed price manually, try to keep originalPrice consistent when discountPercent exists
  onPriceChange() {
    const p = Number(this.productForm.price || 0);
    const pct = Number(this.productForm.discountPercent || 0);
    if (p > 0 && pct > 0) {
      this.productForm.originalPrice = Math.round(p / (1 - pct / 100));
    }
  }

  edit(product: Product) {
    this.productForm = { ...product, imageUrls: [...(product.imageUrls || [])] };
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id: number) {
    if (confirm('Disable product?')) {
      this.api.deleteProduct(id).subscribe(() => {
        this.toast.success('Product disabled');
        this.load();
      });
    }
  }

  resetProduct() {
    this.productForm = this.emptyProduct();
    this.toast.info('Form is ready to add a new product');
  }

  prepareProductPayload(): Partial<Product> {
    const payload = { ...this.productForm };
    if (payload.promotionType === 'NONE') {
      payload.originalPrice = undefined;
      payload.promotionTitle = undefined;
      payload.promotionDescription = undefined;
      payload.giftProductId = undefined;
      payload.giftQuantity = undefined;
    }
    if (payload.promotionType === 'DISCOUNT') {
      payload.giftProductId = undefined;
      payload.giftQuantity = undefined;
      // keep discountPercent only for discount promotions
      if (!payload.discountPercent) payload.discountPercent = undefined;
    }
    if (payload.promotionType === 'GIFT_PRODUCT') {
      payload.originalPrice = undefined;
    }
    if (payload.promotionType !== 'DISCOUNT') {
      payload.discountPercent = undefined;
    }
    return payload;
  }

  showOldPrice(product: Product) {
    return product.promotionType === 'DISCOUNT' && !!product.originalPrice && product.originalPrice > product.price;
  }

  offerLabel(product: Product) {
    if (product.promotionType === 'DISCOUNT') return product.promotionTitle || 'Discount';
    if (product.promotionType === 'GIFT_PRODUCT') return product.promotionTitle || 'Gift';
    return 'No Offer';
  }

  imageUrl(url: string) {
    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
  }

  money(value?: number | null) {
    return `${value || 0} EGP`;
  }

  private emptyProduct(): Partial<Product> {
    return {
      name: '',
      description: '',
      price: 0,
      cost: 0,
      discountPercent: undefined,
      stockQuantity: 0,
      lowStockThreshold: 5,
      active: true,
      featured: false,
      sortOrder: 0,
      promotionType: 'NONE',
      imageUrls: []
    };
  }
}
