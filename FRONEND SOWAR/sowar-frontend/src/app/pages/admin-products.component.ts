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
          <h1>إدارة المنتجات</h1>
          <p class="muted">إضافة وتعديل المنتجات والصور والعروض من صفحة مستقلة.</p>
        </div>
        <div class="actions-row">
          <a class="btn secondary" routerLink="/admin">لوحة التحكم</a>
          <a class="btn" routerLink="/products">معاينة المتجر</a>
        </div>
      </div>

      <section class="card panel">
        <h2>{{ productForm.id ? 'تعديل منتج' : 'إضافة منتج' }}</h2>
        <h3>البيانات الأساسية</h3>
        <div class="form-grid">
          <label>اسم المنتج <input [(ngModel)]="productForm.name"></label>
          <label>التصنيف
            <select [(ngModel)]="productForm.categoryId">
              <option [ngValue]="undefined">اختر التصنيف</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>
          <label>السعر الحالي <input type="number" [(ngModel)]="productForm.price"></label>
          <label>التكلفة <input type="number" [(ngModel)]="productForm.cost"></label>
          <label>الاستوك <input type="number" [(ngModel)]="productForm.stockQuantity"></label>
          <label>حد الاستوك المنخفض <input type="number" [(ngModel)]="productForm.lowStockThreshold"></label>
          <label>الوزن <input [(ngModel)]="productForm.weight"></label>
          <label>المصدر <input [(ngModel)]="productForm.origin"></label>
          <label class="check"><input type="checkbox" [(ngModel)]="productForm.featured"> مميز في الرئيسية</label>
          <label class="check"><input type="checkbox" [(ngModel)]="productForm.active"> ظاهر للعملاء</label>
          <label class="full">الوصف <textarea [(ngModel)]="productForm.description"></textarea></label>
          <label class="full">المكونات <textarea [(ngModel)]="productForm.ingredients"></textarea></label>
          <label class="full">طريقة الاستخدام <textarea [(ngModel)]="productForm.usageInstructions"></textarea></label>
          <label class="full">طريقة التخزين <textarea [(ngModel)]="productForm.storageInstructions"></textarea></label>
        </div>

        <h3>الصور</h3>
        <label class="upload-box">
          إضافة صور للمنتج
          <input type="file" accept="image/*" multiple (change)="uploadProductImages($event)">
        </label>
        @if ((productForm.imageUrls || []).length) {
          <div class="image-list">
            @for (image of productForm.imageUrls; track image) {
              <div class="image-chip">
                <img [src]="imageUrl(image)" alt="صورة المنتج">
                <button class="btn danger" type="button" (click)="removeImage(image)">حذف</button>
              </div>
            }
          </div>
        }

        <h3>العرض</h3>
        <div class="form-grid">
          <label>نوع العرض
            <select [(ngModel)]="productForm.promotionType" (ngModelChange)="onPromotionChange()">
              <option value="NONE">بدون عرض</option>
              <option value="DISCOUNT">خصم على السعر</option>
              <option value="GIFT_PRODUCT">منتج هدية</option>
            </select>
          </label>
          @if (productForm.promotionType === 'DISCOUNT') {
            <label>السعر قبل الخصم <input type="number" [(ngModel)]="productForm.originalPrice"></label>
            <label>عنوان العرض <input [(ngModel)]="productForm.promotionTitle" placeholder="مثال: خصم 15%"></label>
            <label class="full">وصف العرض <textarea [(ngModel)]="productForm.promotionDescription"></textarea></label>
          }
          @if (productForm.promotionType === 'GIFT_PRODUCT') {
            <label>المنتج الهدية
              <select [(ngModel)]="productForm.giftProductId">
                <option [ngValue]="undefined">اختر المنتج الهدية</option>
                @for (product of products(); track product.id) {
                  @if (product.id !== productForm.id) {
                    <option [ngValue]="product.id">{{ product.name }}</option>
                  }
                }
              </select>
            </label>
            <label>كمية الهدية <input type="number" min="1" [(ngModel)]="productForm.giftQuantity"></label>
            <label>عنوان العرض <input [(ngModel)]="productForm.promotionTitle" placeholder="مثال: اشتري واحصل على هدية"></label>
            <label class="full">وصف العرض <textarea [(ngModel)]="productForm.promotionDescription"></textarea></label>
          }
        </div>

        <div class="actions-row">
          <button class="btn" (click)="saveProduct()">حفظ المنتج</button>
          <button class="btn secondary" (click)="resetProduct()">{{ productForm.id ? 'إلغاء التعديل' : 'منتج جديد' }}</button>
        </div>
      </section>

      <section class="card panel">
        <h2>قائمة المنتجات</h2>
        <table>
          <thead><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>العرض</th><th>الاستوك</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr>
                <td>{{ product.name }}</td>
                <td>{{ product.categoryName || '-' }}</td>
                <td>
                  @if (showOldPrice(product)) { <span class="old-price">{{ money(product.originalPrice) }}</span> }
                  <strong>{{ money(product.price) }}</strong>
                </td>
                <td>{{ offerLabel(product) }}</td>
                <td>{{ product.stockQuantity }}</td>
                <td><span class="pill" [class.warn]="product.lowStock">{{ product.active ? 'ظاهر' : 'متوقف' }}</span></td>
                <td>
                  <button class="btn secondary" (click)="edit(product)">تعديل</button>
                  <button class="btn danger" (click)="deleteProduct(product.id)">تعطيل</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7">لا توجد منتجات.</td></tr>
            }
          </tbody>
        </table>
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
    td .btn { margin-inline-start: 6px; }
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
      this.toast.success('تم حفظ المنتج');
      this.resetProduct();
      this.load();
    });
  }

  uploadProductImages(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    files.forEach(file => {
      this.api.uploadImage(file).subscribe(result => {
        this.productForm.imageUrls = [...(this.productForm.imageUrls || []), result.url];
        this.toast.success('تم رفع الصورة');
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
    }
    if (this.productForm.promotionType === 'DISCOUNT') {
      this.productForm.giftProductId = undefined;
      this.productForm.giftQuantity = undefined;
    }
    if (this.productForm.promotionType === 'GIFT_PRODUCT') {
      this.productForm.originalPrice = undefined;
    }
  }

  edit(product: Product) {
    this.productForm = { ...product, imageUrls: [...(product.imageUrls || [])] };
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id: number) {
    if (confirm('تعطيل المنتج؟')) {
      this.api.deleteProduct(id).subscribe(() => {
        this.toast.success('تم تعطيل المنتج');
        this.load();
      });
    }
  }

  resetProduct() {
    this.productForm = this.emptyProduct();
    this.toast.info('النموذج جاهز لإضافة منتج جديد');
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
    }
    if (payload.promotionType === 'GIFT_PRODUCT') {
      payload.originalPrice = undefined;
    }
    return payload;
  }

  showOldPrice(product: Product) {
    return product.promotionType === 'DISCOUNT' && !!product.originalPrice && product.originalPrice > product.price;
  }

  offerLabel(product: Product) {
    if (product.promotionType === 'DISCOUNT') return product.promotionTitle || 'خصم';
    if (product.promotionType === 'GIFT_PRODUCT') return product.promotionTitle || 'هدية';
    return 'بدون عرض';
  }

  imageUrl(url: string) {
    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
  }

  money(value?: number | null) {
    return `${value || 0} ج.م`;
  }

  private emptyProduct(): Partial<Product> {
    return {
      name: '',
      description: '',
      price: 0,
      cost: 0,
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
