import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ShippingGovernorate } from '../core/models';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page register-container fade-in">
      <div class="card register-card">
        <div class="register-card__header">
          <h1>{{ 'CreateAccount' | translate }}</h1>
          <p class="muted">{{ 'RegisterSubtitle' | translate }}</p>
        </div>

        <form #form="ngForm" (ngSubmit)="submit()">
          <h5 class="form-section-title">{{ 'AccountInformation' | translate }}</h5>
          <div class="form-grid">
            <label>{{ 'FullName' | translate }} <input name="fullName" [(ngModel)]="model.fullName" required></label>
            <label>{{ 'PhoneNumber' | translate }} <input name="phone" [(ngModel)]="model.phone" required></label>
            <label class="full">{{ 'Email' | translate }} <input type="email" name="email" [(ngModel)]="model.email" required></label>
            <label class="full password-field">
              {{ 'Password' | translate }}
              <input [type]="passwordVisible ? 'text' : 'password'" name="password" autocomplete="new-password" [(ngModel)]="model.password" required>
              <span class="password-field__toggle" (click)="passwordVisible = !passwordVisible">
                <!-- SVGs here -->
              </span>
            </label>
          </div>

          <h5 class="form-section-title">{{ 'DefaultDeliveryAddress' | translate }}</h5>
          <div class="form-grid">
            <label>{{ 'Governorate' | translate }}
              <select name="governorateId" [(ngModel)]="model.address.governorateId" required>
                <option [ngValue]="0" disabled>{{ 'SelectGovernorate' | translate }}</option>
                @for (gov of governorates(); track gov.id) { <option [ngValue]="gov.id">{{ gov.name }}</option> }
              </select>
            </label>
            <label>{{ 'City' | translate }} <input name="city" [(ngModel)]="model.address.city" required></label>
            <label>{{ 'Street' | translate }} <input name="street" [(ngModel)]="model.address.street" required></label>
            <label>{{ 'Area' | translate }} <input name="area" [(ngModel)]="model.address.area"></label>
            <label>{{ 'BuildingNumber' | translate }} <input name="buildingNumber" [(ngModel)]="model.address.buildingNumber"></label>
            <label>{{ 'Floor' | translate }} <input name="floor" [(ngModel)]="model.address.floor"></label>
            <label class="full">{{ 'Apartment' | translate }} <input name="apartment" [(ngModel)]="model.address.apartment"></label>
            <label class="full">{{ 'Landmark' | translate }} <input name="landmark" [(ngModel)]="model.address.landmark"></label>
          </div>

          <button type="submit" class="btn" [disabled]="form.invalid" style="width: 100%; margin-top: var(--spacing-xl);">{{ 'CreateAccountButton' | translate }}</button>
        </form>

        <p class="text-center" style="margin-top: var(--spacing-xl);">
          {{ 'AlreadyHaveAccount' | translate }} <a routerLink="/login" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">{{ 'LogIn' | translate }}</a>
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
