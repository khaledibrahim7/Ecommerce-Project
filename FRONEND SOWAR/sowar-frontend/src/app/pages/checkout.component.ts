import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cart, ShippingGovernorate, UserProfile } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="section-title">
        <h1>تأكيد الدفع</h1>
        <a class="btn secondary" routerLink="/cart">الرجوع للسلة</a>
      </div>

      @if (cart(); as c) {
        <div class="layout">
          <div class="card panel">
            <h2>بيانات التوصيل</h2>
            @if (profile(); as p) {
              <div class="address-box">
                <strong>عنوان التوصيل</strong>
                <p>{{ addressText(p) }}</p>
                <a routerLink="/profile">تعديل العنوان</a>
              </div>
            }

            <label>ملاحظات التوصيل
              <textarea [(ngModel)]="deliveryNotes" placeholder="مثال: الاتصال قبل الوصول أو أقرب علامة واضحة للبيت"></textarea>
            </label>

            <label>ملاحظات الطلب
              <textarea [(ngModel)]="orderNotes" placeholder="أي تفاصيل خاصة بالطلب نفسه"></textarea>
            </label>

            <div class="cash-box">
              <strong>الدفع كاش عند الاستلام</strong>
              <span>الأوردر هيتسجل بعد الضغط على إتمام الطلب، وبعدها سيتم التواصل معك لتأكيد التفاصيل.</span>
            </div>
          </div>

          <aside class="card panel summary">
            <h2>ملخص الطلب</h2>
            @for (item of c.items; track item.productId) {
              <div class="item-line">
                <span>{{ item.productName }} × {{ item.quantity }}</span>
                <strong>{{ money(item.lineTotal) }}</strong>
              </div>
            } @empty {
              <p class="muted">السلة فارغة.</p>
            }

            <div class="divider"></div>
            <div class="line"><span>إجمالي المنتجات</span><strong>{{ money(c.subtotal) }}</strong></div>
            <div class="line"><span>الشحن</span><strong>{{ money(shippingFee()) }}</strong></div>
            <div class="line total"><span>الإجمالي الكلي</span><strong>{{ money(grandTotal()) }}</strong></div>

            <button class="btn" [disabled]="!c.items.length || placingOrder" (click)="placeOrder()">
              {{ placingOrder ? 'جاري إتمام الطلب...' : 'إتمام الطلب' }}
            </button>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;align-items:start}
    .panel{padding:18px;display:grid;gap:14px}
    .address-box,.cash-box{padding:14px;border:1px solid #eadfca;border-radius:8px;background:#fffaf2}
    .address-box p{margin:8px 0;color:#4a3420;line-height:1.8}
    .address-box a{color:#8a4f00;font-weight:800;text-decoration:none}
    .cash-box{display:grid;gap:6px;color:#4a3420}
    textarea{min-height:96px}
    .summary{position:sticky;top:92px}
    .item-line,.line{display:flex;justify-content:space-between;gap:12px;padding:8px 0}
    .item-line{border-bottom:1px solid #f0e5d2;color:#4a3420}
    .divider{height:1px;background:#eadfca;margin:4px 0}
    .total{font-size:1.15rem;color:#2b1608}
    @media(max-width:900px){.layout{grid-template-columns:1fr}.summary{position:static}}
  `]
})
export class CheckoutComponent implements OnInit {
  cart = signal<Cart | null>(null);
  profile = signal<UserProfile | null>(null);
  governorates = signal<ShippingGovernorate[]>([]);
  deliveryNotes = '';
  orderNotes = '';
  placingOrder = false;

  shippingFee = computed(() => {
    const governorateId = this.profile()?.address?.governorateId;
    return this.governorates().find(g => g.id === governorateId)?.shippingFee || 0;
  });

  grandTotal = computed(() => (this.cart()?.subtotal || 0) + this.shippingFee());

  constructor(private api: ApiService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.cart().subscribe(cart => {
      this.cart.set(cart);
      if (!cart.items.length) this.toast.info('السلة فاضية. أضف منتج الأول.');
    });
    this.api.me().subscribe(profile => this.profile.set(profile));
    this.api.governorates().subscribe(governorates => this.governorates.set(governorates));
  }

  placeOrder() {
    if (this.placingOrder) return;
    const cart = this.cart();
    if (!cart?.items.length) {
      this.toast.error('السلة فاضية. أضف منتج الأول.');
      this.router.navigate(['/cart']);
      return;
    }

    const profile = this.profile();
    const deliveryAddress = profile?.address ? { ...profile.address, deliveryNotes: this.deliveryNotes } : undefined;
    if (!deliveryAddress?.governorateId || !deliveryAddress.city || !deliveryAddress.area || !deliveryAddress.street || !deliveryAddress.buildingNumber) {
      this.toast.error('كمل بيانات العنوان من صفحة حسابي قبل إتمام الطلب.');
      return;
    }

    this.placingOrder = true;
    this.api.checkout(this.orderNotes, deliveryAddress).subscribe({
      next: response => {
        this.placingOrder = false;
        const orderId = response.orderId || response.orderDetails?.id;
        if (!orderId) {
          this.toast.error('تم إنشاء الطلب لكن رقم الطلب غير راجع من السيرفر.');
          return;
        }
        this.toast.success(response.message || 'تم تأكيد الطلب بنجاح');
        this.router.navigate(['/orders', orderId]);
      },
      error: () => {
        this.placingOrder = false;
      }
    });
  }

  addressText(profile: UserProfile) {
    const address = profile.address;
    return [
      address.governorateName,
      address.city,
      address.area,
      address.street,
      address.buildingNumber ? `عمارة ${address.buildingNumber}` : '',
      address.floor ? `دور ${address.floor}` : '',
      address.apartment ? `شقة ${address.apartment}` : '',
      address.landmark ? `علامة: ${address.landmark}` : ''
    ].filter(Boolean).join(' - ');
  }

  money(value?: number | null) {
    return `${value || 0} ج.م`;
  }
}
