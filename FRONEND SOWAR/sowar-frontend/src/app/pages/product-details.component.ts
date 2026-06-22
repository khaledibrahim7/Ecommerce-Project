import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Product, Question, Review } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [FormsModule, DatePipe],
  template: `
    @if (product(); as p) {
      <section class="page details">
        <div class="gallery card">
          <img [src]="selectedImage || imageUrl(p)" [alt]="p.name">
          @if ((p.imageUrls || []).length > 1) {
            <div class="thumbs">
              @for (image of p.imageUrls; track image) {
                <button type="button" (click)="selectedImage = imageUrl(p, image)">
                  <img [src]="imageUrl(p, image)" [alt]="p.name">
                </button>
              }
            </div>
          }
        </div>
        <div class="info">
          <p class="muted">{{ p.categoryName || 'منتج عسل' }}</p>
          <h1>{{ p.name }}</h1>
          <div class="prices">
            @if (showOldPrice(p)) {
              <span class="old-price">{{ p.originalPrice }} ج.م</span>
            }
            <span class="price">{{ p.price }} ج.م</span>
          </div>
          @if (hasOffer(p)) {
            <div class="offer">
              <strong>{{ p.promotionTitle || (p.promotionType === 'DISCOUNT' ? 'خصم' : 'هدية') }}</strong>
              @if (p.promotionDescription) { <span>{{ p.promotionDescription }}</span> }
              @if (p.promotionType === 'GIFT_PRODUCT') { <span>هدية: {{ p.giftProductName }} × {{ p.giftQuantity }}</span> }
            </div>
          }
          <p>{{ p.description }}</p>
          <dl>
            <div><dt>الوزن</dt><dd>{{ p.weight || '-' }}</dd></div>
            <div><dt>المصدر</dt><dd>{{ p.origin || '-' }}</dd></div>
            <div><dt>المكونات</dt><dd>{{ p.ingredients || '-' }}</dd></div>
            <div><dt>الاستخدام</dt><dd>{{ p.usageInstructions || '-' }}</dd></div>
            <div><dt>التخزين</dt><dd>{{ p.storageInstructions || '-' }}</dd></div>
          </dl>
          <div class="buy">
            <input type="number" min="1" [(ngModel)]="quantity">
            <button class="btn" (click)="addToCart(p)">إضافة للسلة</button>
            <button class="btn secondary" (click)="addWishlist(p)">إضافة للمفضلة</button>
          </div>
        </div>
      </section>

      <section class="page support">
        <div class="card box">
          <h2>التقييمات</h2>
          <div class="form-row">
            <select [(ngModel)]="rating">
              <option [ngValue]="5">5 نجوم</option>
              <option [ngValue]="4">4 نجوم</option>
              <option [ngValue]="3">3 نجوم</option>
              <option [ngValue]="2">2 نجوم</option>
              <option [ngValue]="1">1 نجمة</option>
            </select>
            <input [(ngModel)]="reviewComment" placeholder="اكتب تقييمك">
            <button class="btn" (click)="submitReview(p.id)">إرسال</button>
          </div>
          @for (review of reviews(); track review.id) {
            <article class="item">
              <strong>{{ review.customerName }} - {{ review.rating }}/5</strong>
              <p>{{ review.comment }}</p>
              <small>{{ review.createdAt | date:'short' }}</small>
            </article>
          }
        </div>
        <div class="card box">
          <h2>الأسئلة</h2>
          <div class="form-row">
            <input [(ngModel)]="questionText" placeholder="اسأل عن المنتج">
            <button class="btn" (click)="submitQuestion(p.id)">إرسال</button>
          </div>
          @for (question of questions(); track question.id) {
            <article class="item">
              <strong>{{ question.question }}</strong>
              <p>{{ question.answer || 'بانتظار رد الأدمن' }}</p>
            </article>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .details { display: grid; grid-template-columns: minmax(280px, 460px) 1fr; gap: 28px; }
    .gallery { padding: 0; overflow: hidden; background: #f7ecd6; }
    .gallery > img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
    .thumbs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 10px; background: #fffaf2; }
    .thumbs button { border: 1px solid #eadfca; border-radius: 6px; padding: 0; overflow: hidden; background: #fff; cursor: pointer; }
    .thumbs img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 5vw, 4rem); }
    .info { display: grid; gap: 14px; align-content: start; }
    .prices { display: flex; gap: 12px; align-items: baseline; font-size: 1.35rem; }
    .offer { display: grid; gap: 4px; padding: 10px 12px; border-radius: 6px; background: #dcfce7; color: #166534; }
    dl { display: grid; gap: 8px; }
    dl div { display: grid; grid-template-columns: 110px 1fr; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid #eadfca; }
    dt { color: #7c6a55; }
    dd { margin: 0; }
    .buy, .form-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .buy input { width: 90px; }
    .support { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 0; }
    .box { padding: 18px; }
    .item { border-top: 1px solid #eadfca; padding: 12px 0; }
    @media (max-width: 800px) { .details, .support { grid-template-columns: 1fr; } }
  `]
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
    return url ? (url.startsWith('http') ? url : `http://localhost:8080${url}`) : 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1200&q=80';
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.saveCartItem(product.id, this.quantity).subscribe(() => this.toast.success('تمت إضافة المنتج للسلة'));
  }

  addWishlist(product: Product) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addWishlist(product.id).subscribe(() => this.toast.success('تمت إضافة المنتج للمفضلة'));
  }

  submitReview(productId: number) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.addReview(productId, this.rating, this.reviewComment).subscribe(() => { this.reviewComment = ''; this.toast.success('تم إرسال التقييم'); this.loadSocial(productId); });
  }

  submitQuestion(productId: number) {
    if (!this.auth.isLoggedIn()) return this.router.navigate(['/login']);
    return this.api.askQuestion(productId, this.questionText).subscribe(() => { this.questionText = ''; this.toast.success('تم إرسال السؤال'); this.loadSocial(productId); });
  }
}
