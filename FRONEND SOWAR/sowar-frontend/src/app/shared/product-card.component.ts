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
      border: 1px solid #e7e7e7;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }
    .product:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .image-container {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3;
      background: #f7f7f7;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.2s ease;
    }
    .product:hover img {
      transform: scale(1.05);
    }
    .badge {
      position: absolute;
      inset-inline-start: 12px;
      top: 12px;
      padding: 5px 10px;
      border-radius: 6px;
      color: #fff;
      background: #c45500;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      flex-grow: 1;
    }
    .name {
      color: #0F1111;
      font-size: 1rem;
      font-weight: 500;
      text-decoration: none;
      line-height: 1.3;
    }
    .name:hover {
      color: #c45500;
      text-decoration: underline;
    }
    .muted {
      font-size: 0.85rem;
      color: #565959;
    }
    p { margin: 0; }
    .prices {
      display: flex;
      gap: 10px;
      align-items: baseline;
      flex-wrap: wrap;
      margin-top: auto; /* Push to bottom */
      padding-top: 8px;
    }
    .price {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0F1111;
    }
    .old-price {
      text-decoration: line-through;
      color: #565959;
      font-size: 0.9rem;
    }
    .gift {
      color: #007185;
      font-size: .9rem;
      font-weight: 500;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      margin-top: 12px;
    }
    .btn-add-to-cart {
      height: 40px;
      border: 1px solid #F7CA00;
      border-radius: 8px;
      background-color: #FFD814;
      color: #0F1111;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-add-to-cart:hover {
      background-color: #F7CA00;
    }
    .btn-wishlist {
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #d5d9d9;
      border-radius: 8px;
      background-color: #fff;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
    }
    .btn-wishlist:hover {
      background-color: #f7fafa;
      border-color: #c7caca;
    }
    .btn-wishlist svg {
      width: 20px;
      height: 20px;
      color: #565959;
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
      return 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';
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
    return 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80';
  }
}
