import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cart } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.cart().subscribe(cart => this.cart.set(cart));
  }

  update(productId: number, quantity: string | number) {
    const numQuantity = Number(quantity);
    if (numQuantity < 1) {
      this.remove(productId);
      return;
    }
    this.api.saveCartItem(productId, numQuantity).subscribe(cart => {
      this.cart.set(cart);
      this.toast.success('Quantity updated');
    });
  }

  remove(productId: number) {
    this.api.removeCartItem(productId).subscribe(() => {
      this.toast.success('Product removed from cart');
      this.load();
    });
  }

  clear() {
    if (!confirm('Are you sure you want to clear the cart?')) return;
    this.api.clearCart().subscribe(() => {
      this.toast.success('Cart cleared');
      this.load();
    });
  }

  money(value?: number | null) {
    return `${value || 0} EGP`;
  }

  imageUrl(url: string | null | undefined): string {
    if (!url) {
      return 'https://via.placeholder.com/100';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      const baseUrl = 'http://localhost:8080';
      return `${baseUrl}${url}`;
    }
    return 'https://via.placeholder.com/100';
  }
}
