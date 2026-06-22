import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cart } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="section-title">
        <h1>السلة</h1>
        <button class="btn secondary" type="button" (click)="clear()" [disabled]="!cart()?.items?.length">تفريغ السلة</button>
      </div>

      @if (cart(); as c) {
        <div class="layout">
          <div class="card">
            <table>
              <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr></thead>
              <tbody>
                @for (item of c.items; track item.productId) {
                  <tr>
                    <td><a [routerLink]="['/products', item.productId]">{{ item.productName }}</a></td>
                    <td><input type="number" min="1" [value]="item.quantity" (change)="update(item.productId, $any($event.target).value)"></td>
                    <td>{{ money(item.unitPrice) }}</td>
                    <td>{{ money(item.lineTotal) }}</td>
                    <td><button class="btn danger" (click)="remove(item.productId)">حذف</button></td>
                  </tr>
                } @empty {
                  <tr><td colspan="5">السلة فارغة.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <aside class="card summary">
            <h2>ملخص السلة</h2>
            <p class="muted">راجع المنتجات والكميات، وبعدها انتقل لتأكيد العنوان والدفع كاش عند الاستلام.</p>
            <div class="line"><span>إجمالي المنتجات</span><strong>{{ money(c.subtotal) }}</strong></div>
            <button class="btn" [disabled]="!c.items.length" routerLink="/checkout">تأكيد الطلب</button>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    .layout{display:grid;grid-template-columns:1fr 360px;gap:16px}
    .summary{padding:18px;display:grid;gap:12px;align-content:start}
    .address-box{padding:12px;border:1px solid #eadfca;border-radius:8px;background:#fffaf2}
    .address-box p{margin:8px 0;color:#4a3420;line-height:1.8}
    .address-box a{color:#8a4f00;font-weight:800;text-decoration:none}
    .line{display:flex;justify-content:space-between}
    td input{width:80px}
    textarea{min-height:92px}
    @media(max-width:900px){.layout{grid-template-columns:1fr}}
  `]
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.cart().subscribe(cart => this.cart.set(cart));
  }

  update(productId: number, quantity: string) {
    this.api.saveCartItem(productId, Number(quantity)).subscribe(cart => {
      this.cart.set(cart);
      this.toast.success('تم تحديث الكمية');
    });
  }

  remove(productId: number) {
    this.api.removeCartItem(productId).subscribe(() => {
      this.toast.success('تم حذف المنتج من السلة');
      this.load();
    });
  }

  clear() {
    if (!confirm('تفريغ السلة؟')) return;
    this.api.clearCart().subscribe(() => {
      this.toast.success('تم تفريغ السلة');
      this.load();
    });
  }

  money(value?: number | null) {
    return `${value || 0} ج.م`;
  }
}
