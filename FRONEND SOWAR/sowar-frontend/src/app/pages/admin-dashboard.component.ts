import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Expense, Order, Product, Question, Report, Review, ShippingGovernorate } from '../core/models';
import { ToastService } from '../core/toast.service';

type AdminTab = 'overview' | 'orders' | 'questions' | 'reviews' | 'settings' | 'finance';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page admin">
      <div class="section-title admin-head">
        <div>
          <h1>لوحة تحكم سوار</h1>
          <p class="muted">إدارة المنتجات والطلبات والشحن والمصاريف من مكان واحد.</p>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button class="btn secondary" [class.active]="tab === 'overview'" (click)="tab='overview'">نظرة عامة</button>
        <a class="btn secondary" routerLink="/admin/products">المنتجات</a>
        <button class="btn secondary" [class.active]="tab === 'orders'" (click)="tab='orders'">الطلبات</button>
        <button class="btn secondary" [class.active]="tab === 'questions'" (click)="tab='questions'">الأسئلة</button>
        <button class="btn secondary" [class.active]="tab === 'reviews'" (click)="tab='reviews'">المراجعات</button>
        <button class="btn secondary" [class.active]="tab === 'settings'" (click)="tab='settings'">التصنيفات والشحن</button>
        <button class="btn secondary" [class.active]="tab === 'finance'" (click)="tab='finance'">المصاريف</button>
      </div>

      @if (tab === 'overview') {
        <div class="metric-grid">
          <div class="card metric tone-orders"><span>إجمالي الطلبات</span><strong>{{ totalOrders(report()) }}</strong></div>
          <div class="card metric tone-active"><span>طلبات أكتف</span><strong>{{ activeOrders(report()) }}</strong></div>
          <div class="card metric tone-cancelled"><span>طلبات ملغية</span><strong>{{ report()?.cancelledOrdersCount || 0 }}</strong></div>
          <div class="card metric tone-sales"><span>المبيعات</span><strong>{{ money(report()?.revenue) }}</strong></div>
          <div class="card metric tone-profit"><span>صافي الربح</span><strong>{{ money(report()?.netProfit) }}</strong></div>
          <div class="card metric tone-stock"><span>استوك منخفض</span><strong>{{ lowStock().length }}</strong></div>
        </div>
      }

      @if (tab === 'orders') {
        <section class="card panel">
          <h2>الطلبات</h2>
          <table>
            <thead><tr><th>رقم</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>تغيير الحالة</th><th>ملاحظة</th></tr></thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td><a [routerLink]="['/admin/orders', order.id]">#{{ order.id }}</a></td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ money(order.total) }}</td>
                  <td><span class="status-badge {{ order.status }}">{{ statusLabel(order.status) }}</span></td>
                  <td>
                    <select [ngModel]="order.status" (ngModelChange)="updateStatus(order, $event, statusNote.value)">
                      <option value="PLACED">تم الطلب</option>
                      <option value="CONTACTING_CUSTOMER">جاري التواصل</option>
                      <option value="CONFIRMED">تم التأكيد</option>
                      <option value="SHIPPING">قيد الشحن</option>
                      <option value="DELIVERED">تم التسليم</option>
                      <option value="CANCELLED">ملغي</option>
                    </select>
                  </td>
                  <td><input #statusNote placeholder="ملاحظة الحالة"></td>
                </tr>
              } @empty {
                <tr><td colspan="6">لا توجد طلبات.</td></tr>
              }
            </tbody>
          </table>
        </section>
      }

      @if (tab === 'questions') {
        <section class="card panel">
          <h2>أسئلة العملاء</h2>
          @for (question of questions(); track question.id) {
            <div class="question-row">
              <div>
                <strong>{{ question.question }}</strong>
                <p class="muted">{{ question.customerName || 'عميل' }} - {{ productName(question) }}</p>
                @if (question.answer) { <p>{{ question.answer }}</p> }
              </div>
              <div>
                <textarea #answer [placeholder]="question.answer || 'اكتب الإجابة'"></textarea>
                <button class="btn" (click)="answerQuestion(question.id, answer.value)">رد</button>
              </div>
            </div>
          } @empty {
            <p class="empty">لا توجد أسئلة حتى الآن.</p>
          }
        </section>
      }

      @if (tab === 'reviews') {
        <section class="card panel">
          <h2>المراجعات</h2>
          @for (review of reviews(); track review.id) {
            <div class="row">
              <span>{{ review.customerName }} - {{ review.rating }}/5 - {{ productName(review) }}</span>
              <span><button class="btn danger" (click)="deleteReview(review.id)">حذف</button></span>
            </div>
            @if (review.comment) { <p class="muted">{{ review.comment }}</p> }
          } @empty {
            <p class="empty">لا توجد مراجعات.</p>
          }
        </section>
      }

      @if (tab === 'settings') {
        <div class="layout">
          <section class="card panel">
            <h2>التصنيفات</h2>
            <div class="inline-form">
              <input [(ngModel)]="categoryForm.name" placeholder="اسم التصنيف">
              <input [(ngModel)]="categoryForm.description" placeholder="الوصف">
              <button class="btn" (click)="saveCategory()">حفظ</button>
            </div>
            @for (category of categories(); track category.id) {
              <div class="row">
                <span>{{ category.name }}</span>
                <span>
                  <button class="btn secondary" (click)="editCategory(category)">تعديل</button>
                  <button class="btn danger" (click)="deleteCategory(category.id)">حذف</button>
                </span>
              </div>
            }
          </section>

          <section class="card panel">
            <h2>الشحن</h2>
            <div class="inline-form">
              <input [(ngModel)]="governorateForm.name" placeholder="المحافظة">
              <input type="number" [(ngModel)]="governorateForm.shippingFee" placeholder="سعر الشحن">
              <button class="btn" (click)="saveGovernorate()">حفظ</button>
            </div>
            @for (gov of governorates(); track gov.id) {
              <div class="row">
                <span>{{ gov.name }} - {{ money(gov.shippingFee) }}</span>
                <span>
                  <button class="btn secondary" (click)="editGovernorate(gov)">تعديل</button>
                  <button class="btn danger" (click)="deleteGovernorate(gov.id)">حذف</button>
                </span>
              </div>
            }
          </section>
        </div>
      }

      @if (tab === 'finance') {
        <section class="card panel">
          <h2>المصاريف</h2>
          <div class="metric-grid compact">
            <div class="card metric tone-orders"><span>إجمالي الطلبات</span><strong>{{ totalOrders(report()) }}</strong></div>
            <div class="card metric tone-active"><span>طلبات أكتف</span><strong>{{ activeOrders(report()) }}</strong></div>
            <div class="card metric tone-cancelled"><span>طلبات ملغية</span><strong>{{ report()?.cancelledOrdersCount || 0 }}</strong></div>
            <div class="card metric tone-expense"><span>إجمالي المصاريف</span><strong>{{ money(report()?.expenses) }}</strong></div>
            <div class="card metric tone-sales"><span>ربح قبل المصاريف</span><strong>{{ money(report()?.grossProfit) }}</strong></div>
            <div class="card metric tone-profit"><span>صافي ربح الشهر</span><strong>{{ money(report()?.netProfit) }}</strong><small>{{ profitFormula(report()) }}</small></div>
            <div class="card metric tone-profit-year"><span>صافي ربح السنة</span><strong>{{ money(yearlyReport()?.netProfit) }}</strong></div>
          </div>
          <div class="inline-form">
            <input [(ngModel)]="expenseForm.title" placeholder="العنوان">
            <input type="number" [(ngModel)]="expenseForm.amount" placeholder="المبلغ">
            <input type="date" [(ngModel)]="expenseForm.expenseDate">
            <button class="btn" (click)="saveExpense()">حفظ</button>
          </div>
          @for (expense of expenses(); track expense.id) {
            <div class="row">
              <span>{{ expense.title }} - {{ money(expense.amount) }}</span>
              <span>
                <button class="btn secondary" (click)="editExpense(expense)">تعديل</button>
                <button class="btn danger" (click)="deleteExpense(expense.id)">حذف</button>
              </span>
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    .admin { position: relative; width: min(1240px, calc(100% - 28px)); margin-top: 18px; padding: 24px; border-radius: 8px; background: linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,250,240,.5)); overflow: hidden; isolation: isolate; }
    .admin::before {
      content: "سوار";
      position: absolute;
      inset-inline-start: 18px;
      top: -34px;
      z-index: -1;
      color: rgba(166, 106, 20, .055);
      font-size: clamp(7rem, 18vw, 15rem);
      font-weight: 900;
      line-height: 1;
      pointer-events: none;
    }
    .admin-head {
      align-items: center;
      padding: 22px 24px;
      border: 1px solid #eadfca;
      border-radius: 8px;
      background:
        radial-gradient(circle at 8% 20%, rgba(20, 83, 45, .08), transparent 18rem),
        linear-gradient(135deg, rgba(255,255,255,.98), rgba(255,248,233,.92));
      box-shadow: 0 18px 42px rgba(77, 52, 24, .08);
    }
    .admin-head h1 { font-size: clamp(2rem, 4vw, 3rem); color: #24170a; }
    .admin-head .muted { margin: 8px 0 0; color: #7c6a55; }
    .tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 18px 0;
      padding: 8px;
      border: 1px solid #eadfca;
      border-radius: 8px;
      background: rgba(255,255,255,.74);
      box-shadow: 0 12px 30px rgba(77, 52, 24, .07);
    }
    .tabs .btn {
      border-radius: 8px;
      padding: 11px 16px;
      font-weight: 800;
      box-shadow: none;
      color: #4a3420;
      background: #f7ecd6;
    }
    .tabs .active {
      color: #fff;
      background: #24170a;
      box-shadow: 0 10px 24px rgba(36, 23, 10, .18);
    }
    .metric-grid { grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); align-items: stretch; gap: 14px; }
    .metric {
      position: relative;
      min-height: 124px;
      display: grid;
      align-content: center;
      gap: 8px;
      padding: 20px;
      border: 1px solid #eadfca;
      background: rgba(255,255,255,.94);
      overflow: hidden;
      box-shadow: 0 18px 36px rgba(77, 52, 24, .09);
    }
    .metric::before {
      content: "";
      position: absolute;
      inset-inline-start: 0;
      top: 16px;
      bottom: 16px;
      width: 5px;
      border-radius: 999px;
      background: var(--tone, #ca8a04);
    }
    .metric span { color: #4b3824; font-weight: 800; margin: 0; }
    .metric strong { display: block; line-height: 1.1; font-size: 1.9rem; color: #160d05; }
    .metric small { color: #6b4d34; font-size: .88rem; }
    .tone-orders { --tone: #8b5cf6; background: linear-gradient(135deg, #ffffff, #eee7ff); }
    .tone-active { --tone: #10b981; background: linear-gradient(135deg, #ffffff, #dffbf0); }
    .tone-cancelled { --tone: #ef4444; background: linear-gradient(135deg, #ffffff, #ffe4e6); }
    .tone-sales { --tone: #14b8a6; background: linear-gradient(135deg, #ffffff, #dcfffb); }
    .tone-profit { --tone: #d69e2e; background: linear-gradient(135deg, #ffffff, #fff0bd); }
    .tone-stock { --tone: #f97316; background: linear-gradient(135deg, #ffffff, #ffead5); }
    .tone-expense { --tone: #e11d48; background: linear-gradient(135deg, #ffffff, #ffe4ec); }
    .tone-profit-year { --tone: #3b82f6; background: linear-gradient(135deg, #ffffff, #dcecff); }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .panel { padding: 20px; overflow-x: auto; margin-bottom: 16px; background: rgba(255,255,255,.96); box-shadow: 0 18px 42px rgba(77,52,24,.08); }
    .panel h2 { margin-top: 0; }
    h3 { margin: 18px 0 10px; color: #4a3420; }
    .inline-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 14px; }
    .actions-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
    .upload-box { display: grid; gap: 8px; padding: 14px; border: 1px dashed #c88a24; border-radius: 8px; background: #fffaf2; color: #4a3420; font-weight: 800; cursor: pointer; }
    .image-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; }
    .image-chip { display: grid; gap: 6px; padding: 8px; border: 1px solid #eadfca; border-radius: 8px; background: #fff; }
    .image-chip img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 0; border-top: 1px solid #eadfca; }
    .question-row { display: grid; grid-template-columns: 1fr minmax(260px, 360px); gap: 12px; padding: 14px 0; border-top: 1px solid #eadfca; }
    .question-row textarea { min-height: 78px; margin-bottom: 8px; }
    td .btn, .row .btn { margin-inline-start: 6px; }
    .pill { display: inline-flex; padding: 5px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; }
    .pill.warn { background: #fef3c7; color: #92400e; }
    @media(max-width: 980px){ .layout,.inline-form,.question-row { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  tab: AdminTab = 'overview';
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  governorates = signal<ShippingGovernorate[]>([]);
  expenses = signal<Expense[]>([]);
  orders = signal<Order[]>([]);
  questions = signal<Question[]>([]);
  reviews = signal<Review[]>([]);
  report = signal<Report | null>(null);
  yearlyReport = signal<Report | null>(null);
  lowStock = signal<Product[]>([]);
  productForm: Partial<Product> = this.emptyProduct();
  categoryForm: Partial<Category> = {};
  governorateForm: Partial<ShippingGovernorate> = { active: true };
  expenseForm: Partial<Expense> = { expenseDate: new Date().toISOString().slice(0, 10) };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    const now = new Date();
    this.refreshReports();
  }

  load() {
    this.api.adminProducts().subscribe(products => this.products.set(products));
    this.api.categories().subscribe(categories => this.categories.set(categories));
    this.api.adminGovernorates().subscribe(governorates => this.governorates.set(governorates));
    this.api.expenses().subscribe(expenses => this.expenses.set(expenses));
    this.api.adminOrders().subscribe(orders => this.orders.set(orders));
    this.api.adminQuestions().subscribe(questions => this.questions.set(questions));
    this.api.adminReviews().subscribe(reviews => this.reviews.set(reviews));
    this.api.lowStock().subscribe(products => this.lowStock.set(products));
  }

  saveProduct() {
    const product = this.prepareProductPayload();
    this.api.saveProduct(product).subscribe(() => {
      this.toast.success('تم حفظ المنتج');
      this.resetProduct();
      this.load();
    });
  }

  uploadProductImages(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;
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

  updateStatus(order: Order, status: string, note?: string) {
    this.api.updateOrderStatus(order.id, status, note).subscribe(() => {
      this.toast.success('تم تحديث الطلب');
      this.load();
      this.refreshReports();
    });
  }

  answerQuestion(id: number, answer: string) {
    if (!answer.trim()) return;
    this.api.answerQuestion(id, answer).subscribe(() => {
      this.toast.success('تم إرسال الإجابة');
      this.load();
    });
  }

  deleteReview(id: number) {
    if (confirm('حذف المراجعة؟')) {
      this.api.deleteReview(id).subscribe(() => {
        this.toast.success('تم حذف المراجعة');
        this.load();
      });
    }
  }

  editCategory(category: Category) { this.categoryForm = { ...category }; }
  saveCategory() {
    const op = this.categoryForm.id ? this.api.updateCategory(this.categoryForm) : this.api.createCategory(this.categoryForm);
    op.subscribe(() => {
      this.toast.success('تم حفظ التصنيف');
      this.categoryForm = {};
      this.load();
    });
  }
  deleteCategory(id: number) { if (confirm('حذف التصنيف؟')) this.api.deleteCategory(id).subscribe(() => this.load()); }

  editGovernorate(governorate: ShippingGovernorate) { this.governorateForm = { ...governorate }; }
  saveGovernorate() {
    this.api.saveGovernorate({ active: true, ...this.governorateForm }).subscribe(() => {
      this.toast.success('تم حفظ الشحن');
      this.governorateForm = { active: true };
      this.load();
    });
  }
  deleteGovernorate(id: number) { if (confirm('حذف المحافظة؟')) this.api.deleteGovernorate(id).subscribe(() => this.load()); }

  editExpense(expense: Expense) { this.expenseForm = { ...expense }; }
  saveExpense() {
    this.api.saveExpense(this.expenseForm).subscribe(() => {
      this.toast.success('تم حفظ المصروف');
      this.expenseForm = { expenseDate: new Date().toISOString().slice(0, 10) };
      this.load();
      this.refreshReports();
    });
  }
  deleteExpense(id: number) {
    if (confirm('حذف المصروف؟')) {
      this.api.deleteExpense(id).subscribe(() => {
        this.load();
        this.refreshReports();
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

  productName(item: { productName?: string; productId?: number | null }) {
    return item.productName || (item.productId ? `منتج رقم ${item.productId}` : 'منتج غير متاح');
  }

  totalOrders(report: Report | null) {
    if (!report) return 0;
    return report.totalOrdersCount ?? ((report.ordersCount || 0) + (report.cancelledOrdersCount || 0));
  }

  activeOrders(report: Report | null) {
    if (!report) return 0;
    return report.activeOrdersCount ?? report.ordersCount ?? 0;
  }

  profitFormula(report: Report | null) {
    if (!report) return '';
    return `${this.money(report.grossProfit)} - ${this.money(report.expenses)}`;
  }

  statusLabel(status: string) {
    const labels: Record<string, string> = {
      PLACED: 'تم الطلب',
      CONTACTING_CUSTOMER: 'جاري التواصل',
      CONFIRMED: 'تم التأكيد',
      SHIPPING: 'قيد الشحن',
      DELIVERED: 'تم التسليم',
      CANCELLED: 'ملغي'
    };
    return labels[status] || status;
  }

  refreshReports() {
    const now = new Date();
    this.api.monthlyReport(now.getFullYear(), now.getMonth() + 1).subscribe(report => this.report.set(report));
    this.api.yearlyReport(now.getFullYear()).subscribe(report => this.yearlyReport.set(report));
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
