import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ShippingGovernorate } from '../core/models';

@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page register-container fade-in">
      <div class="card register-card">
        <div class="register-card__header">
          <h1>Create a new account</h1>
          <p class="muted">Join us to enjoy the best natural honey products.</p>
        </div>

        <form #form="ngForm" (ngSubmit)="submit()">
          <h5 class="form-section-title">Account Information</h5>
          <div class="form-grid">
            <label>Full Name <input name="fullName" [(ngModel)]="model.fullName" required></label>
            <label>Phone Number <input name="phone" [(ngModel)]="model.phone" required></label>
            <label class="full">Email <input type="email" name="email" [(ngModel)]="model.email" required></label>
            <label class="full password-field">
              Password
              <input [type]="passwordVisible ? 'text' : 'password'" name="password" autocomplete="new-password" [(ngModel)]="model.password" required>
              <span class="password-field__toggle" (click)="passwordVisible = !passwordVisible">
                <!-- SVGs here -->
              </span>
            </label>
          </div>

          <h5 class="form-section-title">Default Delivery Address</h5>
          <div class="form-grid">
            <label>Governorate
              <select name="governorateId" [(ngModel)]="model.address.governorateId" required>
                <option [ngValue]="0" disabled>Select Governorate</option>
                @for (gov of governorates(); track gov.id) { <option [ngValue]="gov.id">{{ gov.name }}</option> }
              </select>
            </label>
            <label>City <input name="city" [(ngModel)]="model.address.city" required></label>
            <label>Street <input name="street" [(ngModel)]="model.address.street" required></label>
            <label>Area <input name="area" [(ngModel)]="model.address.area"></label>
            <label>Building Number <input name="buildingNumber" [(ngModel)]="model.address.buildingNumber"></label>
            <label>Floor <input name="floor" [(ngModel)]="model.address.floor"></label>
            <label class="full">Apartment <input name="apartment" [(ngModel)]="model.address.apartment"></label>
            <label class="full">Landmark <input name="landmark" [(ngModel)]="model.address.landmark"></label>
          </div>

          <button type="submit" class="btn" [disabled]="form.invalid" style="width: 100%; margin-top: var(--spacing-xl);">Create Account</button>
        </form>

        <p class="text-center" style="margin-top: var(--spacing-xl);">
          Already have an account? <a routerLink="/login" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">Log in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: var(--spacing-xl);
    }

    .register-card {
      width: 100%;
      max-width: 800px;
      padding: var(--spacing-2xl);
    }

    .register-card__header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .form-section-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: var(--spacing-xl);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--border-light);
    }

    .password-field {
      position: relative;
    }

    .password-field__toggle {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--text-muted);
      width: 20px;
      height: 20px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  governorates = signal<ShippingGovernorate[]>([]);
  passwordVisible = false;
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
