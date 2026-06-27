import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../core/api.service';
import { Category, ContactLink, ElectronicInvoice, Expense, Order, Product, Question, Report, Review, ShippingGovernorate } from '../core/models';
import { ToastService } from '../core/toast.service';

type AdminTab = 'overview' | 'orders' | 'invoices' | 'questions' | 'reviews' | 'settings' | 'finance' | 'contact';

@Component({
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="page admin">
      <div class="section-title admin-head">
        <div>
          <h1>{{ 'Sowar Dashboard' | translate }}</h1>
          <p class="muted">{{ 'Manage products, orders, shipping, and expenses from one place' | translate }}.</p>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button class="btn secondary" [class.active]="tab === 'overview'" (click)="tab='overview'">{{ 'Overview' | translate }}</button>
        <a class="btn secondary" routerLink="/admin/products">{{ 'Products' | translate }}</a>
        <button class="btn secondary" [class.active]="tab === 'orders'" (click)="tab='orders'">{{ 'Orders' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'invoices'" (click)="tab='invoices'">{{ 'Invoices' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'finance'" (click)="tab='finance'">{{ 'Expenses' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'settings'" (click)="tab='settings'">{{ 'Categories & Shipping' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'questions'" (click)="tab='questions'">{{ 'Questions' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'reviews'" (click)="tab='reviews'">{{ 'Reviews' | translate }}</button>
        <button class="btn secondary" [class.active]="tab === 'contact'" (click)="tab='contact'">{{ 'Contact' | translate }}</button>
      </div>

      @if (tab === 'overview') {
        <div class="metric-grid">
          <div class="card metric tone-orders"><span>{{ 'Total Orders' | translate }}</span><strong>{{ totalOrders(report()) }}</strong></div>
          <div class="card metric tone-active"><span>{{ 'Active Orders' | translate }}</span><strong>{{ activeOrders(report()) }}</strong></div>
          <div class="card metric tone-cancelled"><span>{{ 'Cancelled Orders' | translate }}</span><strong>{{ report()?.cancelledOrdersCount || 0 }}</strong></div>
          <div class="card metric tone-sales"><span>{{ 'Sales' | translate }}</span><strong>{{ money(report()?.revenue) }}</strong></div>
          <div class="card metric tone-profit"><span>{{ 'Net Profit' | translate }}</span><strong>{{ money(report()?.netProfit) }}</strong></div>
          <div class="card metric tone-stock"><span>{{ 'Low Stock' | translate }}</span><strong>{{ lowStock().length }}</strong></div>
        </div>
      }

      @if (tab === 'orders') {
        <section class="card panel">
          <h2>{{ 'Orders' | translate }}</h2>
          <div class="orders-grid">
            @for (order of orders(); track order.id) {
              <div class="order-card">
                <div class="order-header">
                  <h3><a [routerLink]="['/admin/orders', order.id]">#{{ order.id }}</a></h3>
                  <span class="status-badge {{ order.status }}">{{ statusLabel(order.status) }}</span>
                </div>
                <div class="order-body">
                  <p><strong>{{ 'Customer' | translate }}:</strong> {{ order.customerName }}</p>
                  <p><strong>{{ 'Total' | translate }}:</strong> {{ money(order.total) }}</p>
                  <div class="order-actions">
                    <select [ngModel]="order.status" [disabled]="isFinalStatus(order.status)" (ngModelChange)="updateStatus(order, $event, statusNote.value)">
                      <option [value]="order.status">{{ statusLabel(order.status) }}</option>
                      @for (next of nextStatuses(order.status); track next) {
                        <option [value]="next">{{ statusLabel(next) }}</option>
                      }
                    </select>
                    <input #statusNote [placeholder]="'Status note' | translate">
                  </div>
                </div>
              </div>
            } @empty {
              <p>{{ 'No orders found.' | translate }}</p>
            }
          </div>
        </section>
      }

      @if (tab === 'contact') {
        <section class="card panel">
          <h2>{{ 'Contact Links' | translate }}</h2>
          <div class="inline-form">
            <select [(ngModel)]="contactForm.platform">
              <option value="WHATSAPP">{{ 'WhatsApp' | translate }}</option>
              <option value="INSTAGRAM">{{ 'Instagram' | translate }}</option>
              <option value="FACEBOOK">{{ 'Facebook' | translate }}</option>
              <option value="TIKTOK">{{ 'TikTok' | translate }}</option>
              <option value="EMAIL">{{ 'Email' | translate }}</option>
              <option value="PHONE">{{ 'Phone' | translate }}</option>
            </select>
            <input [(ngModel)]="contactForm.value" [placeholder]="'Link, phone, or email' | translate">
            <button class="btn" (click)="saveContact()">{{ 'Save' | translate }}</button>
          </div>
          @for (link of contactLinks(); track link.id) {
            <div class="row">
              <span>{{ platformLabel(link.platform) }} - {{ link.value }}</span>
              <span>
                <button class="btn secondary" (click)="editContact(link)">{{ 'Edit' | translate }}</button>
                <button class="btn danger" (click)="deleteContact(link.id!)">{{ 'Delete' | translate }}</button>
              </span>
            </div>
          } @empty {
            <p class="empty">{{ 'No contact links yet.' | translate }}</p>
          }
        </section>
      }

      @if (tab === 'invoices') {
        <section class="card panel">
          <h2>{{ 'Electronic Invoices' | translate }}</h2>
          <table>
            <thead><tr><th>{{ 'Invoice' | translate }}</th><th>{{ 'Order' | translate }}</th><th>{{ 'Total' | translate }}</th><th>{{ 'Status' | translate }}</th><th>{{ 'Portal Ref' | translate }}</th><th>{{ 'Note' | translate }}</th><th>{{ 'Print' | translate }}</th></tr></thead>
            <tbody>
              @for (invoice of invoices(); track invoice.id) {
                <tr>
                  <td>{{ invoice.invoiceNumber }}</td>
                  <td><a [routerLink]="['/admin/orders', invoice.orderId]">#{{ invoice.orderId }}</a></td>
                  <td>{{ money(invoice.total) }}</td>
                  <td><span class="status-badge {{ invoice.status }}">{{ invoiceStatusLabel(invoice.status) }}</span></td>
                  <td>{{ invoice.portalReference || '-' }}</td>
                  <td>{{ invoice.errorMessage || '-' }}</td>
                  <td><a class="btn secondary" [routerLink]="['/admin/orders', invoice.orderId, 'receipt']">{{ 'Receipt' | translate }}</a></td>
                </tr>
              } @empty {
                <tr><td colspan="7">{{ 'No invoices yet.' | translate }}</td></tr>
              }
            </tbody>
          </table>
        </section>
      }

      @if (tab === 'questions') {
        <section class="card panel">
          <h2>{{ 'Customer Questions' | translate }}</h2>
          @for (question of questions(); track question.id) {
            <div class="question-row">
              <div>
                <strong>{{ question.question }}</strong>
                <p class="muted">{{ question.customerName || ('Customer' | translate) }} - {{ productName(question) }}</p>
                @if (question.answer) { <p>{{ question.answer }}</p> }
              </div>
              <div>
                <textarea #answer [placeholder]="'Write an answer' | translate"></textarea>
                <button class="btn" (click)="answerQuestion(question.id, answer.value)">{{ 'Reply' | translate }}</button>
              </div>
            </div>
          } @empty {
            <p class="empty">{{ 'No questions yet.' | translate }}</p>
          }
        </section>
      }

      @if (tab === 'reviews') {
        <section class="card panel">
          <h2>{{ 'Reviews' | translate }}</h2>
          @for (review of reviews(); track review.id) {
            <div class="row">
              <span>{{ review.customerName }} - {{ review.rating }}/5 - {{ productName(review) }}</span>
              <span><button class="btn danger" (click)="deleteReview(review.id)">{{ 'Delete' | translate }}</button></span>
            </div>
            @if (review.comment) { <p class="muted">{{ review.comment }}</p> }
          } @empty {
            <p class="empty">{{ 'No reviews yet.' | translate }}</p>
          }
        </section>
      }

      @if (tab === 'settings') {
        <div class="layout">
          <section class="card panel">
            <h2>{{ 'Categories' | translate }}</h2>
            <div class="inline-form">
              <input [(ngModel)]="categoryForm.name" [placeholder]="'Category Name' | translate">
              <input [(ngModel)]="categoryForm.description" [placeholder]="'Description' | translate">
              <button class="btn" (click)="saveCategory()">{{ 'Save' | translate }}</button>
            </div>
            @for (category of categories(); track category.id) {
              <div class="row">
                <span>{{ category.name }}</span>
                <span>
                  <button class="btn secondary" (click)="editCategory(category)">{{ 'Edit' | translate }}</button>
                  <button class="btn danger" (click)="deleteCategory(category.id)">{{ 'Delete' | translate }}</button>
                </span>
              </div>
            }
          </section>

          <section class="card panel">
            <h2>{{ 'Shipping' | translate }}</h2>
            <div class="inline-form">
              <input [(ngModel)]="governorateForm.name" [placeholder]="'Governorate' | translate">
              <input type="number" [(ngModel)]="governorateForm.shippingFee" [placeholder]="'Shipping Fee' | translate">
              <button class="btn" (click)="saveGovernorate()">{{ 'Save' | translate }}</button>
            </div>
            @for (gov of governorates(); track gov.id) {
              <div class="row">
                <span>{{ gov.name }} - {{ money(gov.shippingFee) }}</span>
                <span>
                  <button class="btn secondary" (click)="editGovernorate(gov)">{{ 'Edit' | translate }}</button>
                  <button class="btn danger" (click)="deleteGovernorate(gov.id)">{{ 'Delete' | translate }}</button>
                </span>
              </div>
            }
          </section>
        </div>
      }

      @if (tab === 'finance') {
        <section class="card panel">
          <h2>{{ 'Expenses' | translate }}</h2>
          <div class="inline-form">
            <input [(ngModel)]="expenseForm.title" [placeholder]="'Title' | translate">
            <input type="number" [(ngModel)]="expenseForm.amount" [placeholder]="'Amount' | translate">
            <button class="btn" (click)="saveExpense()">{{ 'Save' | translate }}</button>
          </div>
          @for (expense of expenses(); track expense.id) {
            <div class="row">
              <span>{{ expense.title }} - {{ money(expense.amount) }}</span>
              <span>
                <button class="btn secondary" (click)="editExpense(expense)">{{ 'Edit' | translate }}</button>
                <button class="btn danger" (click)="deleteExpense(expense.id)">{{ 'Delete' | translate }}</button>
              </span>
            </div>
          }
        </section>
      }

      @if (confirmDialog(); as dialog) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <h3>{{ dialog.title }}</h3>
            <p>{{ dialog.message }}</p>
            <div class="modal-actions">
              <button class="btn secondary" (click)="confirmDialog.set(null)">{{ 'Cancel' | translate }}</button>
              <button class="btn danger" (click)="dialog.action(); confirmDialog.set(null)">{{ 'Confirm' | translate }}</button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .admin { position: relative; width: min(1240px, calc(100% - 28px)); margin-top: 18px; padding: 24px; border-radius: var(--radius-lg); background: transparent; overflow: hidden; isolation: isolate; }
    .admin::before {
      content: "Sowar";
      position: absolute;
      inset-inline-start: 18px;
      top: -34px;
      z-index: -1;
      color: rgba(212, 163, 92, 0.04);
      font-size: clamp(7rem, 18vw, 15rem);
      font-weight: 900;
      line-height: 1;
      pointer-events: none;
    }
    .admin-head {
      align-items: center;
      padding: 22px 24px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: var(--shadow-sm);
    }
    .admin-head h1 { font-size: clamp(2rem, 4vw, 3rem); color: var(--text-primary); }
    .admin-head .muted { margin: 8px 0 0; color: var(--text-secondary); }
    .tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 18px 0;
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      box-shadow: var(--shadow-sm);
    }
    .tabs .btn {
      border-radius: var(--radius-md);
      padding: 11px 16px;
      font-weight: 800;
      box-shadow: none;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
    }
    .tabs .active {
      color: var(--bg-base);
      background: var(--accent-primary);
      box-shadow: 0 4px 12px var(--shadow-glow);
    }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); align-items: stretch; gap: 14px; }
    .metric {
      position: relative;
      min-height: 124px;
      display: grid;
      align-content: center;
      gap: 8px;
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
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
    .metric span { color: var(--text-secondary); font-weight: 800; margin: 0; }
    .metric strong { display: block; line-height: 1.1; font-size: 1.9rem; color: var(--text-primary); }
    .metric small { color: var(--text-muted); font-size: .88rem; }

    .tone-orders { --tone: #8b5cf6; background: linear-gradient(135deg, var(--bg-card), rgba(139, 92, 246, 0.08)); }
    .tone-active { --tone: #10b981; background: linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.08)); }
    .tone-cancelled { --tone: #ef4444; background: linear-gradient(135deg, var(--bg-card), rgba(239, 68, 68, 0.08)); }
    .tone-sales { --tone: #14b8a6; background: linear-gradient(135deg, var(--bg-card), rgba(20, 184, 166, 0.08)); }
    .tone-profit { --tone: #d4a35c; background: linear-gradient(135deg, var(--bg-card), rgba(212, 163, 92, 0.08)); }
    .tone-stock { --tone: #f97316; background: linear-gradient(135deg, var(--bg-card), rgba(249, 115, 22, 0.08)); }
    .tone-expense { --tone: #e11d48; background: linear-gradient(135deg, var(--bg-card), rgba(225, 29, 72, 0.08)); }
    .tone-profit-year { --tone: #3b82f6; background: linear-gradient(135deg, var(--bg-card), rgba(59, 130, 246, 0.08)); }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .panel { padding: 24px; overflow-x: auto; margin-bottom: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: var(--shadow-md); }
    .panel h2 { margin-top: 0; font-family: var(--font-title); font-size: 1.5rem; color: var(--text-primary); border-bottom: 2px solid var(--accent-primary); padding-bottom: 8px; margin-bottom: 16px; display: inline-block; }
    h3 { margin: 18px 0 10px; color: var(--text-primary); font-family: var(--font-title); }
    .inline-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 14px; }
    .actions-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
    .upload-box { display: grid; gap: 8px; padding: 14px; border: 1px dashed var(--accent-primary); border-radius: var(--radius-md); background: var(--bg-secondary); color: var(--text-secondary); font-weight: 800; cursor: pointer; }
    .image-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; }
    .image-chip { display: grid; gap: 6px; padding: 8px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card); }
    .image-chip img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 0; border-top: 1px solid var(--border-color); }
    .question-row { display: grid; grid-template-columns: 1fr minmax(260px, 360px); gap: 12px; padding: 14px 0; border-top: 1px solid var(--border-color); }
    .question-row textarea { min-height: 78px; margin-bottom: 8px; }
    td .btn, .row .btn { margin-inline-start: 6px; }
    .pill { display: inline-flex; padding: 5px 10px; border-radius: 999px; background: rgba(39, 174, 96, 0.1); color: var(--accent-success); font-weight: 800; }
    .pill.warn { background: rgba(242, 153, 74, 0.1); color: var(--accent-warning); }

    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { padding: 12px; border-bottom: 1px solid var(--border-color); text-align: left; }
    th { font-family: var(--font-title); color: var(--text-primary); font-weight: 700; background: var(--bg-secondary); }
    td { color: var(--text-secondary); }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .order-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
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
    .order-header h3 a {
      color: var(--accent-primary);
      text-decoration: none;
    }
    .order-header h3 a:hover {
      text-decoration: underline;
    }
    .order-body p {
      margin: 4px 0;
      color: var(--text-secondary);
    }
    .order-actions {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    @media(max-width: 980px){ .layout,.inline-form,.question-row { grid-template-columns: 1fr; } }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: grid;
      place-items: center;
      z-index: 1100;
    }
    .modal-card {
      width: min(420px, calc(100% - 32px));
      padding: 24px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: var(--shadow-xl);
      text-align: center;
      animation: modalFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .modal-card h3 {
      font-size: 1.4rem;
      margin-bottom: 12px;
      color: var(--text-primary);
      font-family: var(--font-title);
    }
    .modal-card p {
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    .modal-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
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
  confirmDialog = signal<{ title: string; message: string; action: () => void } | null>(null);

  constructor(private api: ApiService, private toast: ToastService) {}

  confirm(title: string, message: string, action: () => void) {
    this.confirmDialog.set({ title, message, action });
  }

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
    this.confirm('Disable Product', 'Are you sure you want to disable this product?', () => {
      this.api.deleteProduct(id).subscribe(() => {
        this.toast.success('Product disabled');
        this.load();
      });
    });
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
    this.confirm('Delete Review', 'Are you sure you want to delete this review?', () => {
      this.api.deleteReview(id).subscribe(() => {
        this.toast.success('Review deleted');
        this.load();
      });
    });
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
  deleteCategory(id: number) {
    this.confirm('Delete Category', 'Are you sure you want to delete this category?', () => {
      this.api.deleteCategory(id).subscribe(() => {
        this.toast.success('Category deleted');
        this.load();
      });
    });
  }

  editGovernorate(governorate: ShippingGovernorate) { this.governorateForm = { ...governorate }; }
  saveGovernorate() {
    this.api.saveGovernorate({ active: true, ...this.governorateForm }).subscribe(() => {
      this.toast.success('Shipping saved');
      this.governorateForm = { active: true };
      this.load();
    });
  }
  deleteGovernorate(id: number) {
    this.confirm('Delete Governorate', 'Are you sure you want to delete this shipping governorate?', () => {
      this.api.deleteGovernorate(id).subscribe(() => {
        this.toast.success('Governorate deleted');
        this.load();
      });
    });
  }

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
    this.confirm('Delete Expense', 'Are you sure you want to delete this expense?', () => {
      this.api.deleteExpense(id).subscribe(() => {
        this.toast.success('Expense deleted');
        this.load();
        this.refreshReports();
      });
    });
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
    this.confirm('Delete Contact Link', 'Are you sure you want to delete this contact link?', () => {
      this.api.deleteContactLink(id).subscribe(() => {
        this.toast.success('Contact link deleted');
        this.load();
      });
    });
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
