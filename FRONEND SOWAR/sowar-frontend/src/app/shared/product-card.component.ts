import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../core/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <article class="card product">
      <a [routerLink]="['/products', product.id]" class="image">
        <img [src]="imageUrl()" [alt]="product.name">
        @if (hasOffer()) {
          <span class="badge">{{ offerLabel() }}</span>
        }
      </a>
      <div class="body">
        <a [routerLink]="['/products', product.id]" class="name">{{ product.name }}</a>
        <p class="muted">{{ product.categoryName || product.weight || 'عسل طبيعي' }}</p>
        <div class="prices">
          @if (showOldPrice()) {
            <span class="old-price">{{ product.originalPrice }} ج.م</span>
          }
          <span class="price">{{ product.price }} ج.م</span>
        </div>
        @if (product.promotionType === 'GIFT_PRODUCT') {
          <p class="gift">هدية: {{ product.giftProductName }} × {{ product.giftQuantity }}</p>
        }
        <div class="actions">
          <button class="btn" type="button" (click)="addToCart.emit(product)">إضافة للسلة</button>
          <button class="btn secondary" type="button" (click)="toggleWishlist.emit(product)">مفضلة</button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product { display: grid; min-height: 100%; transition: transform .18s ease, box-shadow .18s ease; }
    .product:hover { transform: translateY(-3px); box-shadow: 0 22px 42px rgba(77, 52, 24, .13); }
    .image { position: relative; display: block; aspect-ratio: 4 / 3; background: #f7ecd6; overflow: hidden; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .badge { position: absolute; inset-inline-start: 10px; top: 10px; padding: 6px 8px; border-radius: 6px; color: #fff; background: #b45309; font-size: .82rem; font-weight: 800; }
    .body { display: grid; gap: 8px; padding: 16px; }
    .name { color: #24170a; font-size: 1.05rem; font-weight: 900; text-decoration: none; }
    p { margin: 0; }
    .prices { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
    .price { font-size: 1.12rem; }
    .gift { color: #166534; font-size: .9rem; }
    .actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 6px; }
    .actions .btn { min-height: 48px; font-weight: 800; }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();

  showOldPrice() {
    return this.product.promotionType === 'DISCOUNT' && !!this.product.originalPrice && this.product.originalPrice > this.product.price;
  }

  hasOffer() {
    return this.product.promotionType === 'DISCOUNT' || this.product.promotionType === 'GIFT_PRODUCT';
  }

  offerLabel() {
    if (this.product.promotionTitle) return this.product.promotionTitle;
    return this.product.promotionType === 'DISCOUNT' ? 'خصم' : 'هدية';
  }

  imageUrl() {
    const url = this.product.imageUrls?.[0];
    if (!url) return 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';
    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
  }
}
