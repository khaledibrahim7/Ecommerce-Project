# Sowar Honey Store Backend

Spring Boot backend for the Sowar honey brand.

## Features

- Customer register and login.
- Login by selected identifier type: email or phone.
- Customer profile with detailed delivery address.
- Admin and customer roles with JWT authentication.
- Products with categories, stock quantity, cost, price, and multiple images.
- Product offers: original crossed price, discounted selling price, and gift-product offers.
- Cash-on-delivery order flow.
- Shipping fees by governorate.
- Admin order management and status updates.
- Order items keep a snapshot of product price and offer details at purchase time.
- Customers can view their own orders and order details.
- Cart flow with saved cart items and checkout.
- Admins can open any order details at any time.
- Order status timeline for every order.
- Wishlist.
- Product reviews and ratings.
- Product Q&A.
- Paged product search with sorting.
- Structured exception responses with error codes.
- Manual expenses.
- Monthly and yearly revenue/profit reports.

## Run Locally

1. Create a PostgreSQL database named `sowar_store`.
2. Update credentials in `src/main/resources/application.yml` if needed.
3. Run:

```bash
mvn spring-boot:run
```

Swagger will be available at:

```text
http://localhost:8080/swagger-ui.html
```

## Main API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `PUT /api/me`
- `GET /api/products`
- `GET /api/products/page?q=&categoryId=&featured=&page=0&size=12&sort=featured`
- `GET /api/products/{productId}/reviews`
- `POST /api/products/{productId}/reviews`
- `GET /api/products/{productId}/questions`
- `POST /api/products/{productId}/questions`
- `GET /api/categories`
- `GET /api/shipping-governorates`
- `POST /api/orders`
- `POST /api/orders/checkout`
- `GET /api/orders/my`
- `GET /api/orders/{id}`
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items/{productId}`
- `GET /api/wishlist`
- `POST /api/wishlist/{productId}`
- `DELETE /api/wishlist/{productId}`
- `POST /api/admin/products`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`
- `POST /api/admin/shipping-governorates`
- `PUT /api/admin/shipping-governorates/{id}`
- `DELETE /api/admin/shipping-governorates/{id}`
- `GET /api/admin/orders`
- `GET /api/admin/orders/{id}`
- `PUT /api/admin/orders/{id}/status`
- `DELETE /api/admin/reviews/{id}`
- `PUT /api/admin/questions/{id}/answer`
- `POST /api/admin/finance/expenses`
- `PUT /api/admin/finance/expenses/{id}`
- `DELETE /api/admin/finance/expenses/{id}`
- `GET /api/admin/finance/reports/monthly/{year}/{month}`
- `GET /api/admin/finance/reports/yearly/{year}`

## Register Example

```json
{
  "fullName": "Mahmoud Omar",
  "phone": "01012345678",
  "email": "mahmoud@example.com",
  "password": "12345678",
  "address": {
    "governorateId": 1,
    "city": "Nasr City",
    "area": "Abbas El Akkad",
    "street": "Main Street",
    "buildingNumber": "12",
    "floor": "3",
    "apartment": "7",
    "landmark": "Near the pharmacy",
    "addressType": "HOME",
    "deliveryNotes": "Call before arrival"
  }
}
```

## Login Example

```json
{
  "loginType": "PHONE",
  "identifier": "01012345678",
  "password": "12345678"
}
```
