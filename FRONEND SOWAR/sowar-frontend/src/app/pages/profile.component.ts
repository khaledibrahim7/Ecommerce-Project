import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ShippingGovernorate, UserProfile } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="section-title"><h1>حسابي</h1></div>
      @if (profile(); as p) {
        <form class="card form" ngNoForm (submit)="$event.preventDefault(); save(p)">
          <h2>بيانات الحساب والعنوان</h2>
          <div class="form-grid">
            <label>الاسم <input name="fullName" [(ngModel)]="p.fullName"></label>
            <label>الهاتف <input name="phone" [(ngModel)]="p.phone"></label>
            <label>الإيميل <input name="email" type="email" [(ngModel)]="p.email"></label>
            <label>المحافظة
              <select name="governorateId" [(ngModel)]="p.address.governorateId">
                @for (gov of governorates(); track gov.id) {
                  <option [ngValue]="gov.id">{{ gov.name }}</option>
                }
              </select>
            </label>
            <label>المدينة <input name="city" [(ngModel)]="p.address.city"></label>
            <label>المنطقة <input name="area" [(ngModel)]="p.address.area"></label>
            <label>الشارع <input name="street" [(ngModel)]="p.address.street"></label>
            <label>رقم العمارة <input name="buildingNumber" [(ngModel)]="p.address.buildingNumber"></label>
            <label>الدور <input name="floor" [(ngModel)]="p.address.floor"></label>
            <label>الشقة <input name="apartment" [(ngModel)]="p.address.apartment"></label>
            <label>علامة مميزة <input name="landmark" [(ngModel)]="p.address.landmark"></label>
          </div>
          <button class="btn" type="submit">حفظ البيانات</button>
        </form>
      }

      <form class="card form" ngNoForm (submit)="$event.preventDefault(); changePassword()">
        <h2>تغيير كلمة المرور</h2>
        <div class="form-grid">
          <label>كلمة المرور الحالية <input name="currentPassword" type="password" autocomplete="current-password" [(ngModel)]="currentPassword"></label>
          <label>كلمة المرور الجديدة <input name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword"></label>
        </div>
        <button class="btn secondary" type="submit">تحديث كلمة المرور</button>
      </form>

      <section class="card form danger-zone">
        <h2>حذف الحساب</h2>
        <p class="muted">سيتم تعطيل الحساب ولن تستطيع استخدام الطلبات أو السلة بهذا الحساب.</p>
        <button class="btn danger" type="button" (click)="deleteAccount()">حذف حسابي</button>
      </section>
    </section>
  `,
  styles: [`.form { padding: 18px; display: grid; gap: 16px; margin-bottom: 16px; }.danger-zone { border-color: #fecaca; }`]
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  governorates = signal<ShippingGovernorate[]>([]);
  currentPassword = '';
  newPassword = '';

  constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit() {
    this.api.governorates().subscribe(governorates => this.governorates.set(governorates));
    this.api.me().subscribe(profile => this.profile.set(profile));
  }

  save(profile: UserProfile) {
    this.api.updateMe({
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      address: profile.address
    }).subscribe(updated => {
      this.profile.set(updated);
      this.toast.success('تم حفظ بيانات الحساب');
    });
  }

  changePassword() {
    this.api.changePassword(this.currentPassword, this.newPassword).subscribe(() => {
      this.currentPassword = '';
      this.newPassword = '';
      this.toast.success('تم تغيير كلمة المرور');
    });
  }

  deleteAccount() {
    if (!confirm('هل تريد حذف الحساب؟')) return;
    this.api.deleteMe().subscribe(() => {
      this.toast.success('تم حذف الحساب');
      this.auth.logout();
    });
  }
}
