import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    @if (order(); as o) {
      <section class="page">
        <div class="section-title">
          <div>
            <h1>Order Details #{{ o.id }}</h1>
            <p class="muted">{{ o.customerName }} - {{ o.customerPhone }}</p>
          </div>
          <div class="order-actions">
            <a class="btn secondary" [routerLink]="['/admin/orders', o.id, 'receipt']">Print Cashier Receipt</a>
            <span class="status-badge {{ o.status }}">{{ statusLabel(o.status) }}</span>
          </div>
        </div>

        <div class="layout">
          <section class="card box">
            <h2>Change Status</h2>
            <select [(ngModel)]="status" [disabled]="isFinalStatus(o.status)">
              <option [value]="o.status">{{ statusLabel(o.status) }}</option>
              @for (next of nextStatuses(o.status); track next) {
                <option [value]="next">{{ statusLabel(next) }}</option>
              }
            </select>
            <textarea [(ngModel)]="note" placeholder="Note to appear in order history"></textarea>
            <button class="btn" [disabled]="isFinalStatus(o.status) || status === o.status" (click)="update(o.id)">Save Status</button>
            @if (isFinalStatus(o.status)) {
              <p class="muted">This order status is final and cannot be changed.</p>
            }
          </section>

          <section class="card box">
            <h2>Address</h2>
            <p>{{ o.address }}</p>
            <p class="muted">{{ o.governorate }}</p>
          </section>
        </div>

        <section class="card box">
          <h2>Products</h2>
          @for (item of o.items; track item.productId) {
            <div class="line">
              <span>{{ item.productName }} × {{ item.quantity }}</span>
              <strong>{{ item.lineTotal }} EGP</strong>
            </div>
          }
          <div class="line"><span>Shipping</span><strong>{{ o.shippingFee }} EGP</strong></div>
          <div class="line total"><span>Total</span><strong>{{ o.total }} EGP</strong></div>
        </section>

        <section class="card box">
          <h2>Status History</h2>
          @for (history of o.statusHistory; track history.createdAt) {
            <p><strong>{{ history.status }}</strong> - {{ history.note }} - {{ history.createdAt | date:'short' }}</p>
          } @empty {
            <p class="muted">No history yet.</p>
          }
        </section>
      </section>
    }
  `,
  styles: [`.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}.box{padding:18px;margin-bottom:16px;display:grid;gap:10px}.line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eadfca}.total{font-size:1.2rem}.order-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}@media(max-width:800px){.layout{grid-template-columns:1fr}}`]
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
    if (this.order()?.status === this.status) return;
    this.api.updateOrderStatus(id, this.status, this.note).subscribe(() => {
      this.toast.success('Order status updated');
      this.note = '';
      this.load();
    }, () => this.toast.error('Order status cannot be changed this way'));
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
}
