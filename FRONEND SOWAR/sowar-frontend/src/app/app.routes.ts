import { Routes } from '@angular/router';
import { adminGuard, authGuard, customerGuard } from './core/auth.guard';
import { HomeComponent } from './pages/home.component';
import { ProductsComponent } from './pages/products.component';
import { ProductDetailsComponent } from './pages/product-details.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';
import { OrdersComponent } from './pages/orders.component';
import { OrderDetailsComponent } from './pages/order-details.component';
import { ProfileComponent } from './pages/profile.component';
import { WishlistComponent } from './pages/wishlist.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin-products.component';
import { AdminOrderDetailsComponent } from './pages/admin-order-details.component';
import { LogoutComponent } from './pages/logout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [customerGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [customerGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [customerGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [customerGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [customerGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders/:id', component: AdminOrderDetailsComponent, canActivate: [adminGuard] },
  { path: 'logout', component: LogoutComponent },
  { path: '**', redirectTo: '' }
];
