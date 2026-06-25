import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../core/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <article class="card product">
      <a [routerLink]="['/products', product.id]" class="image-container">
        <img [src]="imageUrl()" [alt]="product.name">
        @if (hasOffer()) {
          <span class="badge">{{ offerLabel() }}</span>
        }
      </a>
      <div class="body">
        <a [routerLink]="['/products', product.id]" class="name">{{ product.name }}</a>
        <p class="muted">{{ product.categoryName || product.weight || 'Natural Honey' }}</p>
        <div class="prices">
          @if (showOldPrice()) {
            <span class="old-price">{{ product.originalPrice }} EGP</span>
          }
          <span class="price">{{ product.price }} EGP</span>
        </div>
        @if (product.promotionType === 'GIFT_PRODUCT') {
          <p class="gift">Gift: {{ product.giftProductName }} × {{ product.giftQuantity }}</p>
        }
        <div class="actions">
          <button class="btn-add-to-cart" type="button" (click)="addToCart.emit(product)">Add to Cart</button>
          <button class="btn-wishlist" type="button" (click)="toggleWishlist.emit(product)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .product {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
    }
    .product:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md), var(--shadow-glow);
      border-color: var(--accent-primary);
    }
    .image-container {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3;
      background: var(--bg-secondary);
      overflow: hidden;
      border-bottom: 1px solid var(--border-light);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform var(--transition-slow);
    }
    .product:hover img {
      transform: scale(1.06);
    }
    .badge {
      position: absolute;
      inset-inline-start: 12px;
      top: 12px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      color: #ffffff;
      background: var(--accent-secondary);
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: var(--spacing-lg);
      flex-grow: 1;
    }
    .name {
      color: var(--text-primary);
      font-family: var(--font-title);
      font-size: 1.05rem;
      font-weight: 700;
      text-decoration: none;
      line-height: 1.35;
      transition: color var(--transition-fast);
    }
    .name:hover {
      color: var(--accent-primary);
    }
    .muted {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    p { margin: 0; }
    .prices {
      display: flex;
      gap: 10px;
      align-items: baseline;
      flex-wrap: wrap;
      margin-top: auto; /* Push to bottom */
      padding-top: 8px;
      border-top: 1px solid var(--border-light);
    }
    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--accent-secondary);
    }
    body.dark-theme .price {
      color: var(--accent-primary);
    }
    .old-price {
      text-decoration: line-through;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .gift {
      color: var(--accent-success);
      font-size: .88rem;
      font-weight: 600;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      margin-top: 12px;
    }
    .btn-add-to-cart {
      height: 40px;
      border: none;
      border-radius: var(--radius-md);
      background-color: var(--accent-primary);
      color: var(--bg-base);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 10px rgba(212, 163, 92, 0.15);
    }
    .btn-add-to-cart:hover {
      background-color: var(--accent-secondary);
      box-shadow: 0 6px 15px rgba(212, 163, 92, 0.3);
      transform: translateY(-1px);
    }
    .btn-wishlist {
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);
    }
    .btn-wishlist:hover {
      background-color: var(--bg-hover);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }
    .btn-wishlist svg {
      width: 20px;
      height: 20px;
      color: currentColor;
    }
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
    return this.product.promotionType === 'DISCOUNT' ? 'Discount' : 'Gift';
  }

  imageUrl() {
    const url = this.product.imageUrls?.[0];
    if (!url) {
      return 'https://unsplash.com/photos/yN5m1L3Xg20/download';
    }
    if (url.startsWith('http')) {
      return url;
    }
    // Check if it's a relative path from the server root
    if (url.startsWith('/')) {
      // This can be configured via an environment variable for flexibility
      const baseUrl = 'http://localhost:8080';
      return `${baseUrl}${url}`;
    }
    // If the URL is malformed or just a filename, return a placeholder
    return 'https://unsplash.com/photos/yN5m1L3Xg20/download';
  }
}
