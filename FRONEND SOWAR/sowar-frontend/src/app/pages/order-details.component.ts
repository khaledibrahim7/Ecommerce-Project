import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Order } from '../core/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [DatePipe, TranslatePipe],
  template: `
    @if (order(); as o) {
      <section class="page">
        <div class="section-title">
          <h1>{{ 'Order' | translate }} #{{ o.id }}</h1>
          <span class="status-badge {{ o.status }}">{{ o.status | translate }}</span>
        </div>
        <div class="layout">
          <div class="card box">
            <h2>{{ 'Products' | translate }}</h2>
            @for (item of o.items; track item.productId) {
              <div class="line">
                <span>{{ item.productName }} × {{ item.quantity }}</span>
                <strong>{{ item.lineTotal }} {{ 'EGP' | translate }}</strong>
              </div>
            }
            <div class="line"><span>{{ 'Shipping' | translate }}</span><strong>{{ o.shippingFee }} {{ 'EGP' | translate }}</strong></div>
            <div class="line total"><span>{{ 'Total' | translate }}</span><strong>{{ o.total }} {{ 'EGP' | translate }}</strong></div>
          </div>
          <div class="card box">
            <h2>{{ 'Address & Payment' | translate }}</h2>
            <p>{{ o.address }}</p>
            <div style="margin-top: 12px; border-top: 1px solid #eadfca; padding-top: 12px; display: flex; flex-direction: column; gap: 6px;">
              <p><strong>{{ 'Payment Method' | translate }}:</strong> {{ getPaymentMethodLabel(o.paymentMethod) | translate }}</p>
              <p style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                <strong>{{ 'Payment Status' | translate }}:</strong>
                <span class="status-badge" [class.PAID]="o.paid" [class.UNPAID]="!o.paid">
                  {{ (o.paid ? 'PAID' : 'UNPAID') | translate }}
                </span>
                @if (!o.paid && o.paymentMethod !== 'CASH') {
                  <button class="btn" (click)="retryPayment(o.id, o.paymentMethod)" [disabled]="loadingPayment" style="padding: 4px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); cursor: pointer; background: var(--accent-primary); border: none; color: var(--bg-base); font-weight: 700;">
                    {{ loadingPayment ? ('Connecting...' | translate) : ('Pay Now' | translate) }}
                  </button>
                }
              </p>
              @if (o.notes) {
                <p style="margin-top: 4px;"><strong>{{ 'Notes' | translate }}:</strong> {{ o.notes }}</p>
              }
            </div>
            <h2 style="margin-top: 16px;">{{ 'History' | translate }}</h2>
            @for (h of o.statusHistory; track h.createdAt) {
              <p><strong>{{ h.status | translate }}</strong> - {{ h.createdAt | date:'short' }}</p>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: [`.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .box { padding: 18px; } .line { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eadfca; } .total { font-size: 1.2rem; } .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; } .status-badge.PAID { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); } .status-badge.UNPAID { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); } @media(max-width:800px){.layout{grid-template-columns:1fr}}`]
})
export class OrderDetailsComponent implements OnInit {
  order = signal<Order | null>(null);
  loadingPayment = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.api.order(Number(this.route.snapshot.paramMap.get('id'))).subscribe(o => this.order.set(o));
  }

  getPaymentMethodLabel(method?: string | null): string {
    if (!method) return 'CASH_PAYMENT';
    const key = method.toUpperCase();
    if (key === 'CASH') return 'CASH_PAYMENT';
    if (key === 'VISA') return 'VISA_PAYMENT';
    if (key === 'WALLET') return 'WALLET_PAYMENT';
    return key;
  }

  retryPayment(orderId: number, method?: string) {
    const activeMethod = method || 'CASH';
    let walletNumber: string | undefined = undefined;
    if (activeMethod.toUpperCase() === 'WALLET') {
      const promptMsg = this.translate.instant('Wallet_Phone_Prompt');
      const input = prompt(promptMsg);
      if (input === null) return;
      if (!input.trim()) {
        alert(this.translate.instant('Please enter the wallet phone number.'));
        return;
      }
      walletNumber = input.trim();
    }

    this.loadingPayment = true;
    this.api.paymobPaymentUrl(orderId, activeMethod, walletNumber).subscribe({
      next: payResponse => {
        this.loadingPayment = false;
        if (payResponse.url) {
          window.location.href = payResponse.url;
        } else {
          alert(this.translate.instant('Failed to generate payment URL.'));
        }
      },
      error: () => {
        this.loadingPayment = false;
        alert(this.translate.instant('An error occurred while connecting to the payment gateway.'));
      }
    });
  }
}
