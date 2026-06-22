import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ShippingGovernorate } from '../core/models';

@Component({
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="section-title">
        <h1>إنشاء حساب</h1>
        <p class="muted">سجل بياناتك الأساسية والعنوان الافتراضي للتوصيل.</p>
      </div>

      <form class="card form" ngNoForm (submit)="$event.preventDefault(); submit()">
        <h2>بيانات الحساب</h2>
        <div class="form-grid">
          <label>الاسم <input name="fullName" [(ngModel)]="model.fullName"></label>
          <label>رقم الهاتف <input name="phone" [(ngModel)]="model.phone"></label>
          <label>الإيميل <input name="email" type="email" [(ngModel)]="model.email"></label>
          <label>كلمة المرور <input name="password" type="password" autocomplete="new-password" [(ngModel)]="model.password"></label>
        </div>

        <h2>عنوان التوصيل الافتراضي</h2>
        <div class="form-grid">
          <label>المحافظة
            <select name="governorateId" [(ngModel)]="model.address.governorateId">
              <option [ngValue]="0">اختر المحافظة</option>
              @for (gov of governorates(); track gov.id) {
                <option [ngValue]="gov.id">{{ gov.name }}</option>
              }
            </select>
          </label>
          <label>المدينة <input name="city" [(ngModel)]="model.address.city"></label>
          <label>المنطقة <input name="area" [(ngModel)]="model.address.area"></label>
          <label>الشارع <input name="street" [(ngModel)]="model.address.street"></label>
          <label>رقم العمارة <input name="buildingNumber" [(ngModel)]="model.address.buildingNumber"></label>
          <label>الدور <input name="floor" [(ngModel)]="model.address.floor"></label>
          <label>الشقة <input name="apartment" [(ngModel)]="model.address.apartment"></label>
          <label>علامة مميزة <input name="landmark" [(ngModel)]="model.address.landmark"></label>
        </div>

        <button class="btn" type="submit">إنشاء الحساب</button>
      </form>
    </section>
  `,
  styles: [`.form { padding: 18px; display: grid; gap: 16px; }`]
})
export class RegisterComponent implements OnInit {
  governorates = signal<ShippingGovernorate[]>([]);
  model = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    address: {
      governorateId: 0,
      city: '',
      area: '',
      street: '',
      buildingNumber: '',
      floor: '',
      apartment: '',
      landmark: '',
      addressType: 'HOME' as const
    }
  };

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.api.governorates().subscribe(data => this.governorates.set(data));
  }

  submit() {
    this.api.register(this.model).subscribe(response => {
      this.auth.setSession(response);
      this.router.navigateByUrl('/');
    });
  }
}
