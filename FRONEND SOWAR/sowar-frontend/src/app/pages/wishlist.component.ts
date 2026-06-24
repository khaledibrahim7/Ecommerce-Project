import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  imports: [ProductCardComponent],
  template: `
    <section class="page">
      <div class="section-title"><h1>Wishlist</h1></div>
      <div class="grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" (addToCart)="addToCart($event)" (toggleWishlist)="remove($event)" />
        } @empty {
          <div class="card empty">No products in the wishlist.</div>
        }
      </div>
    </section>
  `
})
export class WishlistComponent implements OnInit {
  products = signal<Product[]>([]);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.wishlist().subscribe(products => this.products.set(products));
  }

  addToCart(product: Product) {
    this.api.saveCartItem(product.id, 1).subscribe(() => this.toast.success('Product added to cart'));
  }

  remove(product: Product) {
    this.api.removeWishlist(product.id).subscribe(() => {
      this.toast.success('Product removed from wishlist');
      this.load();
    });
  }
}
