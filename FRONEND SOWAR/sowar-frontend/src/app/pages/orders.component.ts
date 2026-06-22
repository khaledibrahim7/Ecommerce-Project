import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';

@Component({
  imports: [RouterLink, DatePipe],
  template: `
    <section class="page">
      <div class="section-title"><h1>طلباتي</h1></div>
      <div class="card">
        <table>
          <thead><tr><th>رقم الطلب</th><th>الحالة</th><th>الإجمالي</th><th>التاريخ</th><th></th></tr></thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>#{{ order.id }}</td>
                <td><span class="status-badge {{ order.status }}">{{ order.status }}</span></td>
                <td>{{ order.total }} ج.م</td>
                <td>{{ order.createdAt | date:'short' }}</td>
                <td><a class="btn secondary" [routerLink]="['/orders', order.id]">تفاصيل</a></td>
              </tr>
            } @empty {
              <tr><td colspan="5">لا توجد طلبات حتى الآن.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.myOrders().subscribe(data => this.orders.set(data)); }
}
