import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, Role } from './models';

const TOKEN_KEY = 'sowar_token';
const USER_KEY = 'sowar_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<AuthResponse | null>(this.readUser());

  constructor(private router: Router) {}

  setSession(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    this.user.set(response);
  }

  token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn() {
    return !!this.token();
  }

  isAdmin() {
    return this.user()?.role === 'ADMIN';
  }

  hasRole(role: Role) {
    return this.user()?.role === role;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigateByUrl('/login');
  }

  private readUser(): AuthResponse | null {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  }
}
