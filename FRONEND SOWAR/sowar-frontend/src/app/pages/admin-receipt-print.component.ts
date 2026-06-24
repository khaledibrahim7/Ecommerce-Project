import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ElectronicInvoice, Order } from '../core/models';

@Component({
  imports: [DatePipe, RouterLink],
  template: `
    <section class="receipt-page">
      <div class="print-actions">
        <a class="btn secondary" [routerLink]="['/admin/orders', order()?.id]">Back to Order</a>
        <button class="btn" type="button" (click)="print()">Print Receipt</button>
      </div>

      @if (order(); as o) {
        <article class="receipt">
          <header>
            <strong class="brand">Sowar</strong>
            <span>Sales Receipt</span>
            <small>{{ o.createdAt | date:'yyyy/MM/dd - hh:mm a' }}</small>
          </header>

          <div class="meta">
            <div><span>Order ID</span><strong>#{{ o.id }}</strong></div>
            <div><span>Invoice No.</span><strong>{{ invoice()?.invoiceNumber || ('SOWAR-' + o.id) }}</strong></div>
          </div>

          <div class="customer">
            <p><strong>{{ o.customerName }}</strong></p>
            <p>{{ o.customerPhone }}</p>
            <p>{{ o.address }}</p>
          </div>

          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              @for (item of o.items; track item.productId) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ money(item.unitPrice) }}</td>
                  <td>{{ money(item.lineTotal) }}</td>
                </tr>
              }
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal</span><strong>{{ money(o.subtotal) }}</strong></div>
            <div><span>Shipping</span><strong>{{ money(o.shippingFee) }}</strong></div>
            <div class="grand"><span>Total</span><strong>{{ money(o.total) }}</strong></div>
          </div>

          <footer>
            <p>Payment: Cash on Delivery</p>
            <p>Thank you for choosing Sowar</p>
          </footer>
        </article>
      }
    </section>
  `,
  styles: [`
    .receipt-page { min-height: 70vh; display: grid; justify-items: center; gap: 16px; padding: 24px; }
    .print-actions { display: flex; gap: 10px; }
    .receipt { width: 80mm; padding: 10px; color: #111; background: #fff; border: 1px solid #ddd; font-family: Tahoma, Arial, sans-serif; font-size: 12px; line-height: 1.45; }
    header, footer { text-align: center; }
    .brand { display: block; font-size: 22px; }
    .meta, .customer, .totals { border-block: 1px dashed #222; margin-block: 8px; padding-block: 8px; }
    .meta div, .totals div { display: flex; justify-content: space-between; gap: 8px; }
    .customer p { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 4px 2px; border-bottom: 1px dashed #ccc; text-align: start; vertical-align: top; }
    th:not(:first-child), td:not(:first-child) { text-align: center; }
    .grand { margin-top: 6px; padding-top: 6px; border-top: 1px solid #111; font-size: 14px; }

    @media print {
      @page { size: 80mm auto; margin: 0; }
      .print-actions { display: none; }
      .receipt-page { display: block; min-height: 0; padding: 0; }
      .receipt { width: 80mm; border: 0; box-shadow: none; }
    }
  `]
})
export class AdminReceiptPrintComponent implements OnInit {
  order = signal<Order | null>(null);
  invoice = signal<ElectronicInvoice | null>(null);

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.adminOrder(id).subscribe(order => this.order.set(order));
    this.api.adminInvoiceByOrder(id).subscribe({
      next: invoice => this.invoice.set(invoice),
      error: () => this.invoice.set(null)
    });
  }

  money(value?: number | null) {
    return `${value || 0} EGP`;
  }

  print() {
    window.print();
  }
}
