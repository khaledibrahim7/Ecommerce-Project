import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, ContactLink, ElectronicInvoice, Expense, Order, Product, Question, Report, Review, ShippingGovernorate } from '../core/models';
import { ToastService } from '../core/toast.service';

type AdminTab = 'overview' | 'orders' | 'invoices' | 'questions' | 'reviews' | 'settings' | 'finance' | 'contact';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page admin">
      <div class="section-title admin-head">
        <div>
          <h1>Sowar Dashboard</h1>
          <p class="muted">Manage products, orders, shipping, and expenses from one place.</p>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button class="btn secondary" [class.active]="tab === 'contact'" (click)="tab='contact'">Contact</button>
        <button class="btn secondary" [class.active]="tab === 'invoices'" (click)="tab='invoices'">Invoices</button>
        <button class="btn secondary" [class.active]="tab === 'overview'" (click)="tab='overview'">Overview</button>
        <a class="btn secondary" routerLink="/admin/products">Products</a>
        <button class="btn secondary" [class.active]="tab === 'orders'" (click)="tab='orders'">Orders</button>
        <button class="btn secondary" [class.active]="tab === 'questions'" (click)="tab='questions'">Questions</button>
        <button class="btn secondary" [class.active]="tab === 'reviews'" (click)="tab='reviews'">Reviews</button>
        <button class="btn secondary" [class.active]="tab === 'settings'" (click)="tab='settings'">Categories & Shipping</button>
        <button class="btn secondary" [class.active]="tab === 'finance'" (click)="tab='finance'">Expenses</button>
      </div>

      @if (tab === 'overview') {
        <div class="metric-grid">
          <div class="card metric tone-orders"><span>Total Orders</span><strong>{{ totalOrders(report()) }}</strong></div>
          <div class="card metric tone-active"><span>Active Orders</span><strong>{{ activeOrders(report()) }}</strong></div>
          <div class="card metric tone-cancelled"><span>Cancelled Orders</span><strong>{{ report()?.cancelledOrdersCount || 0 }}</strong></div>
          <div class="card metric tone-sales"><span>Sales</span><strong>{{ money(report()?.revenue) }}</strong></div>
          <div class="card metric tone-profit"><span>Net Profit</span><strong>{{ money(report()?.netProfit) }}</strong></div>
          <div class="card metric tone-stock"><span>Low Stock</span><strong>{{ lowStock().length }}</strong></div>
        </div>
      }

      @if (tab === 'orders') {
        <section class="card panel">
          <h2>Orders</h2>
          <div class="orders-grid">
            @for (order of orders(); track order.id) {
              <div class="order-card">
                <div class="order-header">
                  <h3><a [routerLink]="['/admin/orders', order.id]">#{{ order.id }}</a></h3>
                  <span class="status-badge {{ order.status }}">{{ statusLabel(order.status) }}</span>
                </div>
                <div class="order-body">
                  <p><strong>Customer:</strong> {{ order.customerName }}</p>
                  <p><strong>Total:</strong> {{ money(order.total) }}</p>
                  <div class="order-actions">
                    <select [ngModel]="order.status" [disabled]="isFinalStatus(order.status)" (ngModelChange)="updateStatus(order, $event, statusNote.value)">
                      <option [value]="order.status">{{ statusLabel(order.status) }}</option>
                      @for (next of nextStatuses(order.status); track next) {
                        <option [value]="next">{{ statusLabel(next) }}</option>
                      }
                    </select>
                    <input #statusNote placeholder="Status note">
                  </div>
                </div>
              </div>
            } @empty {
              <p>No orders found.</p>
            }
          </div>
        </section>
      }

      @if (tab === 'contact') {
        <section class="card panel">
          <h2>Contact Links</h2>
          <div class="inline-form">
            <select [(ngModel)]="contactForm.platform">
              <option value="WHATSAPP">WhatsApp</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="TIKTOK">TikTok</option>
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="LINK">Other Link</option>
            </select>
            <input [(ngModel)]="contactForm.value" placeholder="Link, phone, or email">
            <input type="number" [(ngModel)]="contactForm.sortOrder" placeholder="Sort">
            <button class="btn" (click)="saveContact()">Save</button>
          </div>
          @for (link of contactLinks(); track link.id) {
            <div class="row">
              <span>{{ platformLabel(link.platform) }} - {{ link.value }}</span>
              <span>
                <button class="btn secondary" (click)="editContact(link)">Edit</button>
                <button class="btn danger" (click)="deleteContact(link.id!)">Delete</button>
              </span>
            </div>
          } @empty {
            <p class="empty">No contact links yet.</p>
          }
        </section>
      }

      @if (tab === 'invoices') {
        <section class="card panel">
          <h2>Electronic Invoices</h2>
          <table>
            <thead><tr><th>Invoice</th><th>Order</th><th>Total</th><th>Status</th><th>Portal Ref</th><th>Note</th><th>Print</th></tr></thead>
            <tbody>
              @for (invoice of invoices(); track invoice.id) {
                <tr>
                  <td>{{ invoice.invoiceNumber }}</td>
                  <td><a [routerLink]="['/admin/orders', invoice.orderId]">#{{ invoice.orderId }}</a></td>
                  <td>{{ money(invoice.total) }}</td>
                  <td><span class="status-badge {{ invoice.status }}">{{ invoiceStatusLabel(invoice.status) }}</span></td>
                  <td>{{ invoice.portalReference || '-' }}</td>
                  <td>{{ invoice.errorMessage || '-' }}</td>
                  <td><a class="btn secondary" [routerLink]="['/admin/orders', invoice.orderId, 'receipt']">Receipt</a></td>
                </tr>
              } @empty {
                <tr><td colspan="7">No invoices yet.</td></tr>
              }
            </tbody>
          </table>
        </section>
      }

      @if (tab === 'questions') {
        <section class="card panel">
          <h2>Customer Questions</h2>
          @for (question of questions(); track question.id) {
            <div class="question-row">
              <div>
                <strong>{{ question.question }}</strong>
                <p class="muted">{{ question.customerName || 'Customer' }} - {{ productName(question) }}</p>
                @if (question.answer) { <p>{{ question.answer }}</p> }
              </div>
              <div>
                <textarea #answer [placeholder]="question.answer || 'Write an answer'"></textarea>
                <button class="btn" (click)="answerQuestion(question.id, answer.value)">Reply</button>
              </div>
            </div>
          } @empty {
            <p class="empty">No questions yet.</p>
          }
        </section>
      }

      @if (tab === 'reviews') {
        <section class="card panel">
          <h2>Reviews</h2>
          @for (review of reviews(); track review.id) {
            <div class="row">
              <span>{{ review.customerName }} - {{ review.rating }}/5 - {{ productName(review) }}</span>
              <span><button class="btn danger" (click)="deleteReview(review.id)">Delete</button></span>
            </div>
            @if (review.comment) { <p class="muted">{{ review.comment }}</p> }
          } @empty {
            <p class="empty">No reviews yet.</p>
          }
        </section>
      }

      @if (tab === 'settings') {
        <div class="layout">
          <section class="card panel">
            <h2>Categories</h2>
            <div class="inline-form">
              <input [(ngModel)]="categoryForm.name" placeholder="Category Name">
              <input [(ngModel)]="categoryForm.description" placeholder="Description">
              <button class="btn" (click)="saveCategory()">Save</button>
            </div>
            @for (category of categories(); track category.id) {
              <div class="row">
                <span>{{ category.name }}</span>
                <span>
                  <button class="btn secondary" (click)="editCategory(category)">Edit</button>
                  <button class="btn danger" (click)="deleteCategory(category.id)">Delete</button>
                </span>
              </div>
            }
          </section>

          <section class="card panel">
            <h2>Shipping</h2>
            <div class="inline-form">
              <input [(ngModel)]="governorateForm.name" placeholder="Governorate">
              <input type="number" [(ngModel)]="governorateForm.shippingFee" placeholder="Shipping Fee">
              <button class="btn" (click)="saveGovernorate()">Save</button>
            </div>
            @for (gov of governorates(); track gov.id) {
              <div class="row">
                <span>{{ gov.name }} - {{ money(gov.shippingFee) }}</span>
                <span>
                  <button class="btn secondary" (click)="editGovernorate(gov)">Edit</button>
                  <button class="btn danger" (click)="deleteGovernorate(gov.id)">Delete</button>
                </span>
              </div>
            }
          </section>
        </div>
      }

      @if (tab === 'finance') {
        <section class="card panel">
          <h2>Expenses</h2>
          <div class="metric-grid compact">
            <div class="card metric tone-orders"><span>Total Orders</span><strong>{{ totalOrders(report()) }}</strong></div>
            <div class="card metric tone-active"><span>Active Orders</span><strong>{{ activeOrders(report()) }}</strong></div>
            <div class="card metric tone-cancelled"><span>Cancelled Orders</span><strong>{{ report()?.cancelledOrdersCount || 0 }}</strong></div>
            <div class="card metric tone-expense"><span>Total Expenses</span><strong>{{ money(report()?.expenses) }}</strong></div>
            <div class="card metric tone-sales"><span>Gross Profit</span><strong>{{ money(report()?.grossProfit) }}</strong></div>
            <div class="card metric tone-profit"><span>Monthly Net Profit</span><strong>{{ money(report()?.netProfit) }}</strong><small>{{ profitFormula(report()) }}</small></div>
            <div class="card metric tone-profit-year"><span>Yearly Net Profit</span><strong>{{ money(yearlyReport()?.netProfit) }}</strong></div>
          </div>
          <div class="inline-form">
            <input [(ngModel)]="expenseForm.title" placeholder="Title">
            <input type="number" [(ngModel)]="expenseForm.amount" placeholder="Amount">
            <input type="date" [(ngModel)]="expenseForm.expenseDate">
            <button class="btn" (click)="saveExpense()">Save</button>
          </div>
          @for (expense of expenses(); track expense.id) {
            <div class="row">
              <span>{{ expense.title }} - {{ money(expense.amount) }}</span>
              <span>
                <button class="btn secondary" (click)="editExpense(expense)">Edit</button>
                <button class="btn danger" (click)="deleteExpense(expense.id)">Delete</button>
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
      content: "Sowar";
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

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .order-card {
      border: 1px solid #eadfca;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .order-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    .order-body p {
      margin: 4px 0;
    }
    .order-actions {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

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
  invoices = signal<ElectronicInvoice[]>([]);
  contactLinks = signal<ContactLink[]>([]);
  questions = signal<Question[]>([]);
  reviews = signal<Review[]>([]);
  report = signal<Report | null>(null);
  yearlyReport = signal<Report | null>(null);
  lowStock = signal<Product[]>([]);
  productForm: Partial<Product> = this.emptyProduct();
  categoryForm: Partial<Category> = {};
  governorateForm: Partial<ShippingGovernorate> = { active: true };
  expenseForm: Partial<Expense> = { expenseDate: new Date().toISOString().slice(0, 10) };
  contactForm: Partial<ContactLink> = { platform: 'WHATSAPP', sortOrder: 0 };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.refreshReports();
  }

  load() {
    this.api.adminProducts().subscribe(products => this.products.set(products));
    this.api.categories().subscribe(categories => this.categories.set(categories));
    this.api.adminGovernorates().subscribe(governorates => this.governorates.set(governorates));
    this.api.expenses().subscribe(expenses => this.expenses.set(expenses));
    this.api.adminOrders().subscribe(orders => this.orders.set(orders));
    this.api.adminInvoices().subscribe(invoices => this.invoices.set(invoices));
    this.api.adminContactLinks().subscribe(links => this.contactLinks.set(links));
    this.api.adminQuestions().subscribe(questions => this.questions.set(questions));
    this.api.adminReviews().subscribe(reviews => this.reviews.set(reviews));
    this.api.lowStock().subscribe(products => this.lowStock.set(products));
  }

  saveProduct() {
    const product = this.prepareProductPayload();
    this.api.saveProduct(product).subscribe(() => {
      this.toast.success('Product saved');
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
    if (confirm('Disable product?')) {
      this.api.deleteProduct(id).subscribe(() => {
        this.toast.success('Product disabled');
        this.load();
      });
    }
  }

  updateStatus(order: Order, status: string, note?: string) {
    if (status === order.status) return;
    this.api.updateOrderStatus(order.id, status, note).subscribe(() => {
      this.toast.success('Order updated');
      this.load();
      this.refreshReports();
    }, () => this.toast.error('Cannot change order status this way'));
  }

  answerQuestion(id: number, answer: string) {
    if (!answer.trim()) return;
    this.api.answerQuestion(id, answer).subscribe(() => {
      this.toast.success('Answer sent');
      this.load();
    });
  }

  deleteReview(id: number) {
    if (confirm('Delete review?')) {
      this.api.deleteReview(id).subscribe(() => {
        this.toast.success('Review deleted');
        this.load();
      });
    }
  }

  editCategory(category: Category) { this.categoryForm = { ...category }; }
  saveCategory() {
    const op = this.categoryForm.id ? this.api.updateCategory(this.categoryForm) : this.api.createCategory(this.categoryForm);
    op.subscribe(() => {
      this.toast.success('Category saved');
      this.categoryForm = {};
      this.load();
    });
  }
  deleteCategory(id: number) { if (confirm('Delete category?')) this.api.deleteCategory(id).subscribe(() => this.load()); }

  editGovernorate(governorate: ShippingGovernorate) { this.governorateForm = { ...governorate }; }
  saveGovernorate() {
    this.api.saveGovernorate({ active: true, ...this.governorateForm }).subscribe(() => {
      this.toast.success('Shipping saved');
      this.governorateForm = { active: true };
      this.load();
    });
  }
  deleteGovernorate(id: number) { if (confirm('Delete governorate?')) this.api.deleteGovernorate(id).subscribe(() => this.load()); }

  editExpense(expense: Expense) { this.expenseForm = { ...expense }; }
  saveExpense() {
    this.api.saveExpense(this.expenseForm).subscribe(() => {
      this.toast.success('Expense saved');
      this.expenseForm = { expenseDate: new Date().toISOString().slice(0, 10) };
      this.load();
      this.refreshReports();
    });
  }
  deleteExpense(id: number) {
    if (confirm('Delete expense?')) {
      this.api.deleteExpense(id).subscribe(() => {
        this.load();
        this.refreshReports();
      });
    }
  }

  editContact(link: ContactLink) { this.contactForm = { ...link }; }

  saveContact() {
    const platform = this.contactForm.platform || 'WHATSAPP';
    this.api.saveContactLink({
      active: true,
      sortOrder: 0,
      ...this.contactForm,
      platform,
      label: this.platformLabel(platform)
    }).subscribe(() => {
      this.toast.success('Contact link saved');
      this.contactForm = { platform: 'WHATSAPP', sortOrder: 0 };
      this.load();
    });
  }

  platformLabel(platform?: string) {
    const labels: Record<string, string> = {
      WHATSAPP: 'WhatsApp',
      INSTAGRAM: 'Instagram',
      FACEBOOK: 'Facebook',
      TIKTOK: 'TikTok',
      EMAIL: 'Email',
      PHONE: 'Phone',
      LINK: 'Link'
    };
    return labels[(platform || '').toUpperCase()] || 'Link';
  }

  deleteContact(id: number) {
    if (confirm('Delete contact link?')) {
      this.api.deleteContactLink(id).subscribe(() => this.load());
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

  productName(item: { productName?: string; productId?: number | null }) {
    return item.productName || (item.productId ? `Product #${item.productId}` : 'Product not available');
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
      PLACED: 'Placed',
      CONTACTING_CUSTOMER: 'Contacting',
      CONFIRMED: 'Confirmed',
      SHIPPING: 'Shipping',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  }

  isFinalStatus(status: string) {
    return status === 'DELIVERED' || status === 'CANCELLED';
  }

  nextStatuses(status: string) {
    const flow: Record<string, string[]> = {
      PLACED: ['CONTACTING_CUSTOMER', 'CONFIRMED', 'CANCELLED'],
      CONTACTING_CUSTOMER: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: []
    };
    return flow[status] || [];
  }

  invoiceStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING_CONFIGURATION: 'Portal Setup Needed',
      PENDING_SUBMISSION: 'Ready to Submit',
      SUBMITTED: 'Submitted',
      FAILED: 'Failed'
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
