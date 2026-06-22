import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';

@Component({
  imports: [DatePipe],
  template: `
    @if (order(); as o) {
      <section class="page">
        <div class="section-title"><h1>طلب #{{ o.id }}</h1><span class="status-badge {{ o.status }}">{{ o.status }}</span></div>
        <div class="layout">
          <div class="card box">
            <h2>المنتجات</h2>
            @for (item of o.items; track item.productId) {
              <div class="line"><span>{{ item.productName }} × {{ item.quantity }}</span><strong>{{ item.lineTotal }} ج.م</strong></div>
            }
            <div class="line"><span>الشحن</span><strong>{{ o.shippingFee }} ج.م</strong></div>
            <div class="line total"><span>الإجمالي</span><strong>{{ o.total }} ج.م</strong></div>
          </div>
          <div class="card box">
            <h2>العنوان</h2>
            <p>{{ o.address }}</p>
            <h2>التاريخ</h2>
            @for (h of o.statusHistory; track h.createdAt) {
              <p><strong>{{ h.status }}</strong> - {{ h.createdAt | date:'short' }}</p>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: [`.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .box { padding: 18px; } .line { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eadfca; } .total { font-size: 1.2rem; } @media(max-width:800px){.layout{grid-template-columns:1fr}}`]
})
export class OrderDetailsComponent implements OnInit {
  order = signal<Order | null>(null);
  constructor(private route: ActivatedRoute, private api: ApiService) {}
  ngOnInit() { this.api.order(Number(this.route.snapshot.paramMap.get('id'))).subscribe(o => this.order.set(o)); }
}
