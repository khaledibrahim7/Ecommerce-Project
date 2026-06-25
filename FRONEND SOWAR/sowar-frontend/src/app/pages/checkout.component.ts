import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cart, ShippingGovernorate, UserProfile } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [FormsModule],
  template: `
    <div class="page fade-in">
      <div class="section-title">
        <h1>Checkout</h1>
      </div>

      @if (cart(); as c) {
        <div class="checkout-layout">
          <main class="checkout-panel card">
            @if (step() === 1) {
              <h2 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28"><path d="M11.25 3.75A1.5 1.5 0 0 1 12.75 3h3A1.5 1.5 0 0 1 17.25 4.5v3a1.5 1.5 0 0 1-3 0V6h-1.5a1.5 1.5 0 0 1-1.5-1.5V3.75Z" /><path fill-rule="evenodd" d="M6 3.75A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V9.75A2.25 2.25 0 0 0 18 7.5h-3.75a.75.75 0 0 1-.75-.75V3.75H6Zm4.5 9a.75.75 0 0 0 0 1.5h.008a.75.75 0 0 0 0-1.5h-.008ZM10.5 7.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V8.25a.75.75 0 0 1 .75-.75Zm1.5.75a.75.75 0 0 0-1.5 0v.008a.75.75 0 0 0 1.5 0V8.25Z" clip-rule="evenodd" /></svg>
                <span>1. Shipping Address</span>
              </h2>

              @if (isEditingAddress()) {
                <!-- Edit Mode -->
                @if(editableProfile(); as p) {
                  <div class="form-grid">
                    <label>Full Name <input [(ngModel)]="p.fullName"></label>
                    <label>Phone Number <input [(ngModel)]="p.phone"></label>
                    <label>Governorate
                      <select [(ngModel)]="p.address.governorateId">
                        @for (gov of governorates(); track gov.id) { <option [ngValue]="gov.id">{{ gov.name }}</option> }
                      </select>
                    </label>
                    <label>City <input [(ngModel)]="p.address.city"></label>
                    <label class="full">Street <input [(ngModel)]="p.address.street"></label>
                    <label>Area <input [(ngModel)]="p.address.area"></label>
                    <label>Building Number <input [(ngModel)]="p.address.buildingNumber"></label>
                    <label>Floor <input [(ngModel)]="p.address.floor"></label>
                    <label>Apartment <input [(ngModel)]="p.address.apartment"></label>
                    <label class="full">Landmark <input [(ngModel)]="p.address.landmark"></label>
                  </div>
                  <div class="action-buttons">
                    <button class="btn ghost" (click)="toggleEditAddress()">Cancel</button>
                    <div style="display: flex; gap: var(--spacing-md);">
                      <button class="btn secondary" (click)="saveAddress(false)">For this shipment only</button>
                      <button class="btn" (click)="saveAddress(true)">Save and update my profile</button>
                    </div>
                  </div>
                }
              } @else {
                <!-- Display Mode -->
                @if (profile(); as p) {
                  <div class="address-display">
                    <div class="address-display__header">
                      <strong>{{ p.fullName }}</strong>
                      <button class="btn ghost" (click)="toggleEditAddress()" style="padding: 4px 8px; font-size: 0.8rem;">Edit</button>
                    </div>
                    <p>{{ addressText(p) }}</p>
                    <p class="muted">{{ p.phone }}</p>
                  </div>
                  <div>
                    <label for="deliveryNotes">Delivery Notes (optional)</label>
                    <textarea id="deliveryNotes" [(ngModel)]="deliveryNotes" placeholder="e.g., Call before arriving..."></textarea>
                  </div>
                  <button class="btn" (click)="goToNextStep()">Continue to Review & Payment</button>
                } @else {
                  <p class="empty">Loading your data...</p>
                }
              }
            } @else {
              <!-- Step 2: Review & Payment -->
              <h2 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28"><path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" /><path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" /></svg>
                <span>2. Review & Payment</span>
              </h2>
              <div class="review-items">
                @for (item of c.items; track item.productId) {
                  <div class="review-item">
                    <img [src]="imageUrl(item.imageUrl)" [alt]="item.productName">
                    <div class="review-item__info">
                      <span>{{ item.productName }}</span>
                      <small>Quantity: {{ item.quantity }}</small>
                    </div>
                    <strong class="price">{{ money(item.lineTotal) }}</strong>
                  </div>
                }
              </div>
              <!-- Luxury Payment Methods Selector -->
              <div class="payment-section">
                <h3>طريقة الدفع / Payment Method</h3>
                <div class="payment-grid">
                  <button type="button" class="payment-option-card" [class.active]="selectedPaymentMethod() === 'CASH'" (click)="selectedPaymentMethod.set('CASH')">
                    <div class="option-icon">💵</div>
                    <div class="option-info">
                      <strong>الدفع عند الاستلام (COD)</strong>
                      <small>الدفع كاش عند استلام الأوردر.</small>
                    </div>
                  </button>

                  <button type="button" class="payment-option-card" [class.active]="selectedPaymentMethod() === 'VISA'" (click)="selectedPaymentMethod.set('VISA')">
                    <div class="option-icon">💳</div>
                    <div class="option-info">
                      <strong>بطاقة ائتمان (Visa / Card)</strong>
                      <small>الدفع أونلاين بالفيزا أو الماستركارد.</small>
                    </div>
                  </button>

                  <button type="button" class="payment-option-card" [class.active]="selectedPaymentMethod() === 'WALLET'" (click)="selectedPaymentMethod.set('WALLET')">
                    <div class="option-icon">📱</div>
                    <div class="option-info">
                      <strong>محفظة إلكترونية (Wallet)</strong>
                      <small>فودافون كاش أو إنستاباي.</small>
                    </div>
                  </button>
                </div>

                <div class="payment-method-details">
                  @if (selectedPaymentMethod() === 'CASH') {
                    <p class="muted">📦 سيتم تأكيد الأوردر هاتفياً وشحنه فوراً والدفع نقداً عند الاستلام.</p>
                  }
                  @else if (selectedPaymentMethod() === 'VISA') {
                    <div class="payment-instruction mock-card-form">
                      <label>رقم البطاقة / Card Number <input placeholder="4000 1234 5678 9010" disabled></label>
                      <div class="half-inputs">
                        <label>تاريخ الانتهاء / Expiry <input placeholder="MM / YY" disabled></label>
                        <label>رمز الأمان / CVV <input placeholder="123" disabled></label>
                      </div>
                      <p class="mock-info-tag">⚠️ بوابة الدفع بالبطاقة حالياً قيد التجربة (Sandbox Mode).</p>
                    </div>
                  }
                  @else if (selectedPaymentMethod() === 'WALLET') {
                    <div class="payment-instruction wallet-details">
                      <label>رقم المحفظة الإلكترونية (فودافون كاش / إلخ) / Wallet Phone Number
                        <input [(ngModel)]="walletNumber" placeholder="01012345678" type="tel" style="width: 100%; box-sizing: border-box; margin-top: 6px;">
                      </label>
                      <p class="muted" style="margin-top: 8px;">⚠️ سيتم توجيهك إلى صفحة تأكيد الدفع الخاصة بمحفظتك بعد النقر على الزر بالأسفل.</p>
                    </div>
                  }
                </div>
              </div>
              <div class="action-buttons">
                <button class="btn secondary" (click)="step.set(1)">Back</button>
                <button class="btn" [disabled]="placingOrder" (click)="placeOrder()">
                  {{ placingOrder ? 'Placing Order...' : (selectedPaymentMethod() === 'CASH' ? 'Confirm Final Order' : 'Pay Now & Confirm') }}
                </button>
              </div>
            }
          </main>
          <aside class="summary-panel card">
            <h2 class="panel-title">Order Summary</h2>
            <div class="summary-line"><span>Subtotal</span><strong>{{ money(c.subtotal) }}</strong></div>
            <div class="summary-line"><span>Shipping Fee</span><strong>{{ money(shippingFee()) }}</strong></div>
            <div class="summary-line total"><span>Grand Total</span><strong>{{ money(grandTotal()) }}</strong></div>
          </aside>
        </div>
      } @else {
        <p class="empty">Loading data...</p>
      }
    </div>
  `,
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  step = signal(1);
  cart = signal<Cart | null>(null);
  profile = signal<UserProfile | null>(null);
  editableProfile = signal<UserProfile | null>(null);
  isEditingAddress = signal(false);
  governorates = signal<ShippingGovernorate[]>([]);
  deliveryNotes = '';
  orderNotes = '';
  placingOrder = false;
  selectedPaymentMethod = signal('CASH');
  walletNumber = '';

  shippingFee = computed(() => {
    const activeProfile = this.isEditingAddress() ? this.editableProfile() : this.profile();
    const governorateId = activeProfile?.address?.governorateId;
    return this.governorates().find(g => g.id === governorateId)?.shippingFee || 0;
  });

  grandTotal = computed(() => (this.cart()?.subtotal || 0) + this.shippingFee());

  constructor(private api: ApiService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.api.cart().subscribe(cart => {
      if (!cart.items.length) this.router.navigate(['/cart']);
      this.cart.set(cart);
    });
    this.api.me().subscribe(profile => this.profile.set(profile));
    this.api.governorates().subscribe(governorates => this.governorates.set(governorates));
  }

  toggleEditAddress() {
    if (!this.isEditingAddress() && this.profile()) {
      this.editableProfile.set(JSON.parse(JSON.stringify(this.profile())));
    }
    this.isEditingAddress.update(v => !v);
  }

  saveAddress(updatePermanently: boolean) {
    const editedProfile = this.editableProfile();
    if (!editedProfile) return;

    if (updatePermanently) {
      // Save to backend and update local state
      this.api.updateMe(editedProfile).subscribe(updatedProfile => {
        this.profile.set(updatedProfile);
        this.toast.success('Your profile has been updated successfully');
        this.isEditingAddress.set(false);
      });
    } else {
      // Temporarily update the profile for this checkout session
      this.profile.set(editedProfile);
      this.isEditingAddress.set(false);
      this.toast.info('Address updated for this shipment only');
    }
  }

  goToNextStep() {
    this.step.set(2);
  }

  placeOrder() {
    if (this.placingOrder) return;
    const deliveryAddress = this.profile()?.address;
    if (!deliveryAddress) return this.toast.error('No shipping address found.');

    const method = this.selectedPaymentMethod();
    if (method === 'WALLET' && !this.walletNumber.trim()) {
      return this.toast.error('يرجى إدخال رقم المحفظة الإلكترونية.');
    }

    this.placingOrder = true;
    this.api.checkout(this.deliveryNotes, { ...deliveryAddress, deliveryNotes: this.deliveryNotes }, method).subscribe({
      next: response => {
        const orderId = response.orderId || response.orderDetails?.id;
        
        if (method === 'CASH') {
          this.placingOrder = false;
          this.toast.success(response.message || 'Order confirmed successfully!');
          this.router.navigate(['/orders', orderId]);
        } else {
          // VISA or WALLET payment redirection
          this.toast.info('جاري الاتصال ببوابة Paymob، يرجى الانتظار...');
          this.api.paymobPaymentUrl(orderId, method, this.walletNumber).subscribe({
            next: payResponse => {
              this.placingOrder = false;
              if (payResponse.url) {
                // Redirect user to Paymob Accept
                window.location.href = payResponse.url;
              } else {
                this.toast.error('Failed to generate payment URL.');
                this.router.navigate(['/orders', orderId]);
              }
            },
            error: () => {
              this.placingOrder = false;
              this.toast.error('حدث خطأ أثناء الاتصال ببوابة الدفع.');
              this.router.navigate(['/orders', orderId]);
            }
          });
        }
      },
      error: () => {
        this.placingOrder = false;
        this.toast.error('An error occurred while placing the order.');
      }
    });
  }

  addressText(profile: UserProfile | null) {
    if (!profile?.address) return 'No address found';
    const addr = profile.address;
    return [addr.governorateName, addr.city, addr.street, addr.buildingNumber, addr.floor, addr.apartment, addr.landmark].filter(Boolean).join(', ');
  }

  money(value?: number | null) {
    return `${value || 0} EGP`;
  }

  imageUrl(url: string | null | undefined): string {
    if (!url) return 'https://via.placeholder.com/64';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `http://localhost:8080${url}`;
    return 'https://via.placeholder.com/64';
  }
}
