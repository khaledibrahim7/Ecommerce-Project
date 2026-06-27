import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Product, Question, Review } from '../core/models';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [FormsModule, DatePipe, TranslatePipe],
  template: `
    <div class="page fade-in">
      @if (product(); as p) {
        <div class="details-grid">
          <div class="gallery">
            <div class="card gallery__main-image">
              <img [src]="selectedImage || imageUrl(p)" [alt]="p.name">
            </div>
            @if ((p.imageUrls || []).length > 1) {
              <div class="gallery__thumbs">
                @for (image of p.imageUrls; track image) {
                  <button type="button" class="thumb-btn" [class.active]="imageUrl(p, image) === selectedImage" (click)="selectedImage = imageUrl(p, image)">
                    <img [src]="imageUrl(p, image)" [alt]="p.name">
                  </button>
                }
              </div>
            }
          </div>
          <div class="card info">
            <p class="info__category">{{ (p.categoryName || 'Honey Product') | translate }}</p>
            <h1 class="info__title">{{ p.name }}</h1>
            <div class="prices">
              <span class="price">{{ p.price }} EGP</span>
              @if (showOldPrice(p)) {
                <span class="old-price">{{ p.originalPrice }} EGP</span>
              }
            </div>
            @if (hasOffer(p)) {
              <div class="status-badge" [class.CANCELLED]="p.promotionType === 'DISCOUNT'" [class.PLACED]="p.promotionType === 'GIFT_PRODUCT'">
                <strong>{{ p.promotionTitle || (p.promotionType === 'DISCOUNT' ? 'Discount' : 'Gift') }}</strong>
              </div>
            }
            <p class="info__description">{{ p.description }}</p>
            <div class="buy-actions">
              <div class="quantity-selector">
                <button (click)="quantity = quantity > 1 ? quantity - 1 : 1">-</button>
                <input type="number" min="1" [(ngModel)]="quantity">
                <button (click)="quantity = quantity + 1">+</button>
              </div>
              <button class="btn" (click)="addToCart(p)">{{ 'Add to Cart' | translate }}</button>
              <button class="btn secondary" (click)="addWishlist(p)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px; height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <section class="specs-section card">
          <h3 class="filters-panel__title">{{ 'Product Specifications' | translate }}</h3>
          <dl class="specs-dl">
            @if(p.weight) { <div><dt>{{ 'Weight' | translate }}</dt><dd>{{ p.weight }}</dd></div> }
            @if(p.origin) { <div><dt>{{ 'Origin' | translate }}</dt><dd>{{ p.origin }}</dd></div> }
            @if(p.ingredients) { <div><dt>{{ 'Ingredients' | translate }}</dt><dd>{{ p.ingredients }}</dd></div> }
            @if(p.usageInstructions) { <div><dt>{{ 'Usage' | translate }}</dt><dd>{{ p.usageInstructions }}</dd></div> }
            @if(p.storageInstructions) { <div><dt>{{ 'Storage' | translate }}</dt><dd>{{ p.storageInstructions }}</dd></div> }
          </dl>
        </section>

        <section class="support-section">
          <h2 class="section-title">{{ 'Reviews and Questions' | translate }}</h2>
          <div class="support-grid">
            <div class="card">
              <h3 class="filters-panel__title">{{ 'Reviews' | translate }} ({{ reviews().length }})</h3>
              <div class="support-form">
                <select [(ngModel)]="rating">
                  <option [ngValue]="5">5 {{ 'stars' | translate }}</option>
                  <option [ngValue]="4">4 {{ 'stars' | translate }}</option>
                  <option [ngValue]="3">3 {{ 'stars' | translate }}</option>
                  <option [ngValue]="2">2 {{ 'stars' | translate }}</option>
                  <option [ngValue]="1">1 {{ 'stars' | translate }}</option>
                </select>
                <input [(ngModel)]="reviewComment" [placeholder]="'Write your review' | translate">
                <button class="btn ghost" (click)="submitReview(p.id)">{{ 'Submit' | translate }}</button>
              </div>
              @for (review of reviews(); track review.id) {
                <article class="item-card">
                  <strong>{{ review.customerName }} - {{ review.rating }}/5</strong>
                  <p>{{ review.comment }}</p>
                  <small>{{ review.createdAt | date:'short' }}</small>
                </article>
              } @empty { <p class="empty">{{ 'No reviews yet.' | translate }}</p> }
            </div>
            <div class="card">
              <h3 class="filters-panel__title">{{ 'Questions' | translate }} ({{ questions().length }})</h3>
              <div class="support-form">
                <input [(ngModel)]="questionText" [placeholder]="'Ask about the product' | translate">
                <button class="btn ghost" (click)="submitQuestion(p.id)">{{ 'Submit' | translate }}</button>
              </div>
              @for (question of questions(); track question.id) {
                <article class="item-card">
                  <strong>{{ question.question }}</strong>
                  <p>{{ question.answer || ('Waiting for admin response' | translate) }}</p>
                </article>
              } @empty { <p class="empty">{{ 'No questions yet.' | translate }}</p> }
            </div>
          </div>
        </section>
      } @else {
        <p class="empty">{{ 'Loading product...' | translate }}</p>
      }
    </div>
  `,
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  questions = signal<Question[]>([]);
  selectedImage = '';
  quantity = 1;
  rating = 5;
  reviewComment = '';
  questionText = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.product(id).subscribe(product => {
      this.product.set(product);
      this.selectedImage = this.imageUrl(product);
    });
    this.loadSocial(id);
  }

  loadSocial(productId: number) {
    this.api.productReviews(productId).subscribe(reviews => this.reviews.set(reviews));
    this.api.productQuestions(productId).subscribe(questions => this.questions.set(questions));
  }

  showOldPrice(product: Product) {
    return product.promotionType === 'DISCOUNT' && !!product.originalPrice && product.originalPrice > product.price;
  }

  hasOffer(product: Product) {
    return product.promotionType === 'DISCOUNT' || product.promotionType === 'GIFT_PRODUCT';
  }

  imageUrl(product: Product, forcedUrl?: string) {
    const url = forcedUrl || product.imageUrls?.[0];
    if (!url) {
      return 'https://unsplash.com/photos/yN5m1L3Xg20/download';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      const baseUrl = 'http://localhost:8080';
      return `${baseUrl}${url}`;
    }
    return 'https://unsplash.com/photos/yN5m1L3Xg20/download';
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, this.quantity).subscribe(() => this.toast.success('Product added to cart'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('Product added to wishlist'));
  }

  submitReview(productId: number) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    if (!this.reviewComment) return this.toast.error('Please write a review');
    return this.api.addReview(productId, this.rating, this.reviewComment).subscribe(() => { this.reviewComment = ''; this.toast.success('Review submitted successfully'); this.loadSocial(productId); });
  }

  submitQuestion(productId: number) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    if (!this.questionText) return this.toast.error('Please write a question');
    return this.api.askQuestion(productId, this.questionText).subscribe(() => { this.questionText = ''; this.toast.success('Question submitted successfully'); this.loadSocial(productId); });
  }
}
