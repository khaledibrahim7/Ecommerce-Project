import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [DatePipe, FormsModule],
  template: `
    @if (order(); as o) {
      <section class="page">
        <div class="section-title">
          <div>
            <h1>تفاصيل طلب #{{ o.id }}</h1>
            <p class="muted">{{ o.customerName }} - {{ o.customerPhone }}</p>
          </div>
          <span class="status-badge {{ o.status }}">{{ o.status }}</span>
        </div>

        <div class="layout">
          <section class="card box">
            <h2>تغيير الحالة</h2>
            <select [(ngModel)]="status">
              <option value="PLACED">PLACED</option>
              <option value="CONTACTING_CUSTOMER">CONTACTING_CUSTOMER</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <textarea [(ngModel)]="note" placeholder="ملاحظة تظهر في تاريخ الطلب"></textarea>
            <button class="btn" (click)="update(o.id)">حفظ الحالة</button>
          </section>

          <section class="card box">
            <h2>العنوان</h2>
            <p>{{ o.address }}</p>
            <p class="muted">{{ o.governorate }}</p>
          </section>
        </div>

        <section class="card box">
          <h2>المنتجات</h2>
          @for (item of o.items; track item.productId) {
            <div class="line">
              <span>{{ item.productName }} × {{ item.quantity }}</span>
              <strong>{{ item.lineTotal }} ج.م</strong>
            </div>
          }
          <div class="line"><span>الشحن</span><strong>{{ o.shippingFee }} ج.م</strong></div>
          <div class="line total"><span>الإجمالي</span><strong>{{ o.total }} ج.م</strong></div>
        </section>

        <section class="card box">
          <h2>تاريخ الحالة</h2>
          @for (history of o.statusHistory; track history.createdAt) {
            <p><strong>{{ history.status }}</strong> - {{ history.note }} - {{ history.createdAt | date:'short' }}</p>
          } @empty {
            <p class="muted">لا يوجد تاريخ بعد.</p>
          }
        </section>
      </section>
    }
  `,
  styles: [`.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}.box{padding:18px;margin-bottom:16px;display:grid;gap:10px}.line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eadfca}.total{font-size:1.2rem}@media(max-width:800px){.layout{grid-template-columns:1fr}}`]
})
export class AdminOrderDetailsComponent implements OnInit {
  order = signal<Order | null>(null);
  status = 'PLACED';
  note = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.adminOrder(id).subscribe(order => {
      this.order.set(order);
      this.status = order.status;
    });
  }

  update(id: number) {
    this.api.updateOrderStatus(id, this.status, this.note).subscribe(() => {
      this.toast.success('تم تحديث حالة الطلب');
      this.note = '';
      this.load();
    });
  }
}
