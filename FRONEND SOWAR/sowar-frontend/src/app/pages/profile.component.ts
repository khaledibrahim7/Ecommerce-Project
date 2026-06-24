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
      <div class="section-title"><h1>My Account</h1></div>
      @if (profile(); as p) {
        <form class="card form" ngNoForm (submit)="$event.preventDefault(); save(p)">
          <h2>Account and Address Information</h2>
          <div class="form-grid">
            <label>Name <input name="fullName" [(ngModel)]="p.fullName"></label>
            <label>Phone <input name="phone" [(ngModel)]="p.phone"></label>
            <label>Email <input name="email" type="email" [(ngModel)]="p.email"></label>
            <label>Governorate
              <select name="governorateId" [(ngModel)]="p.address.governorateId">
                @for (gov of governorates(); track gov.id) {
                  <option [ngValue]="gov.id">{{ gov.name }}</option>
                }
              </select>
            </label>
            <label>City <input name="city" [(ngModel)]="p.address.city"></label>
            <label>Area <input name="area" [(ngModel)]="p.address.area"></label>
            <label>Street <input name="street" [(ngModel)]="p.address.street"></label>
            <label>Building Number <input name="buildingNumber" [(ngModel)]="p.address.buildingNumber"></label>
            <label>Floor <input name="floor" [(ngModel)]="p.address.floor"></label>
            <label>Apartment <input name="apartment" [(ngModel)]="p.address.apartment"></label>
            <label>Landmark <input name="landmark" [(ngModel)]="p.address.landmark"></label>
          </div>
          <button class="btn" type="submit">Save Information</button>
        </form>
      }

      <form class="card form" ngNoForm (submit)="$event.preventDefault(); changePassword()">
        <h2>Change Password</h2>
        <div class="form-grid">
          <label>Current Password
            <div class="password-wrapper">
              <input name="currentPassword" [type]="currentPasswordVisible ? 'text' : 'password'" autocomplete="current-password" [(ngModel)]="currentPassword">
              <span class="toggle-password" (click)="currentPasswordVisible = !currentPasswordVisible">
                @if (currentPasswordVisible) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.43-4.43a1.012 1.012 0 011.43 0l4.43 4.43a1.012 1.012 0 010 .639l-4.43 4.43a1.012 1.012 0 01-1.43 0l-4.43-4.43z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              </span>
            </div>
          </label>
          <label>New Password
            <div class="password-wrapper">
              <input name="newPassword" [type]="newPasswordVisible ? 'text' : 'password'" autocomplete="new-password" [(ngModel)]="newPassword">
              <span class="toggle-password" (click)="newPasswordVisible = !newPasswordVisible">
                @if (newPasswordVisible) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.43-4.43a1.012 1.012 0 011.43 0l4.43 4.43a1.012 1.012 0 010 .639l-4.43 4.43a1.012 1.012 0 01-1.43 0l-4.43-4.43z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              </span>
            </div>
          </label>
        </div>
        <button class="btn secondary" type="submit">Update Password</button>
      </form>

      <section class="card form danger-zone">
        <h2>Delete Account</h2>
        <p class="muted">The account will be disabled and you will not be able to use orders or the cart with this account.</p>
        <button class="btn danger" type="button" (click)="deleteAccount()">Delete My Account</button>
      </section>
    </section>
  `,
  styles: [`
    .form { padding: 18px; display: grid; gap: 16px; margin-bottom: 16px; }
    .danger-zone { border-color: #fecaca; }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .password-wrapper input {
      width: 100%;
      padding-left: 3rem; /* Make space for the icon */
    }
    .toggle-password {
      position: absolute;
      top: 50%;
      left: 12px;
      transform: translateY(-50%);
      cursor: pointer;
      user-select: none;
      color: #555;
      width: 24px;
      height: 24px;
    }
    .toggle-password svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  governorates = signal<ShippingGovernorate[]>([]);
  currentPassword = '';
  newPassword = '';
  currentPasswordVisible = false;
  newPasswordVisible = false;

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
      this.toast.success('Account information saved');
    });
  }

  changePassword() {
    this.api.changePassword(this.currentPassword, this.newPassword).subscribe(() => {
      this.currentPassword = '';
      this.newPassword = '';
      this.toast.success('Password changed successfully');
    });
  }

  deleteAccount() {
    if (!confirm('Are you sure you want to delete your account?')) return;
    this.api.deleteMe().subscribe(() => {
      this.toast.success('Account deleted successfully');
      this.auth.logout();
    });
  }
}
