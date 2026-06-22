import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddressRequest, AuthResponse, Cart, Category, CheckoutResponse, Expense, LoginType, Order, PageResponse, Product, Question, Report, Review, ShippingGovernorate, UserProfile } from './models';

const API_URL = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  login(loginType: LoginType, identifier: string, password: string) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { loginType, identifier, password });
  }

  register(payload: { fullName: string; phone: string; email: string; password: string; address: AddressRequest }) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, payload);
  }

  products(params: { q?: string; categoryId?: number; featured?: boolean; page?: number; size?: number; sort?: string }) {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<PageResponse<Product>>(`${API_URL}/products/page`, { params: httpParams });
  }

  product(id: number) {
    return this.http.get<Product>(`${API_URL}/products/${id}`);
  }

  categories() {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }

  governorates() {
    return this.http.get<ShippingGovernorate[]>(`${API_URL}/shipping-governorates`);
  }

  productReviews(productId: number) {
    return this.http.get<Review[]>(`${API_URL}/products/${productId}/reviews`);
  }

  addReview(productId: number, rating: number, comment: string) {
    return this.http.post<Review>(`${API_URL}/products/${productId}/reviews`, { rating, comment });
  }

  productQuestions(productId: number) {
    return this.http.get<Question[]>(`${API_URL}/products/${productId}/questions`);
  }

  askQuestion(productId: number, question: string) {
    return this.http.post<Question>(`${API_URL}/products/${productId}/questions`, { question });
  }

  cart() {
    return this.http.get<Cart>(`${API_URL}/cart`);
  }

  saveCartItem(productId: number, quantity: number) {
    return this.http.post<Cart>(`${API_URL}/cart/items`, { productId, quantity });
  }

  removeCartItem(productId: number) {
    return this.http.delete<void>(`${API_URL}/cart/items/${productId}`);
  }

  clearCart() {
    return this.http.delete<void>(`${API_URL}/cart`);
  }

  checkout(notes?: string, deliveryAddress?: AddressRequest) {
    return this.http.post<CheckoutResponse>(`${API_URL}/orders/checkout`, { notes, deliveryAddress });
  }

  myOrders() {
    return this.http.get<Order[]>(`${API_URL}/orders/my`);
  }

  order(id: number) {
    return this.http.get<Order>(`${API_URL}/orders/${id}`);
  }

  adminOrder(id: number) {
    return this.http.get<Order>(`${API_URL}/admin/orders/${id}`);
  }

  me() {
    return this.http.get<UserProfile>(`${API_URL}/me`);
  }

  updateMe(profile: { fullName: string; phone: string; email: string; address: AddressRequest }) {
    return this.http.put<UserProfile>(`${API_URL}/me`, profile);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put<void>(`${API_URL}/me/password`, { currentPassword, newPassword });
  }

  deleteMe() {
    return this.http.delete<void>(`${API_URL}/me`);
  }

  wishlist() {
    return this.http.get<Product[]>(`${API_URL}/wishlist`);
  }

  addWishlist(productId: number) {
    return this.http.post<void>(`${API_URL}/wishlist/${productId}`, {});
  }

  removeWishlist(productId: number) {
    return this.http.delete<void>(`${API_URL}/wishlist/${productId}`);
  }

  adminProducts() {
    return this.http.get<Product[]>(`${API_URL}/admin/products`);
  }

  saveProduct(product: Partial<Product>) {
    return product.id
      ? this.http.put<Product>(`${API_URL}/admin/products/${product.id}`, product)
      : this.http.post<Product>(`${API_URL}/admin/products`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${API_URL}/admin/products/${id}`);
  }

  adminOrders() {
    return this.http.get<Order[]>(`${API_URL}/admin/orders`);
  }

  updateOrderStatus(id: number, status: string, note?: string) {
    return this.http.put<Order>(`${API_URL}/admin/orders/${id}/status`, { status, note });
  }

  monthlyReport(year: number, month: number) {
    return this.http.get<Report>(`${API_URL}/admin/finance/reports/monthly/${year}/${month}`);
  }

  yearlyReport(year: number) {
    return this.http.get<Report>(`${API_URL}/admin/finance/reports/yearly/${year}`);
  }

  lowStock() {
    return this.http.get<Product[]>(`${API_URL}/admin/products/low-stock`);
  }

  adminQuestions() {
    return this.http.get<Question[]>(`${API_URL}/admin/questions`);
  }

  answerQuestion(id: number, answer: string) {
    return this.http.put<Question>(`${API_URL}/admin/questions/${id}/answer`, { answer });
  }

  adminReviews() {
    return this.http.get<Review[]>(`${API_URL}/admin/reviews`);
  }

  deleteReview(id: number) {
    return this.http.delete<void>(`${API_URL}/admin/reviews/${id}`);
  }

  createCategory(category: Partial<Category>) {
    return this.http.post<Category>(`${API_URL}/admin/categories`, category);
  }

  updateCategory(category: Partial<Category>) {
    return this.http.put<Category>(`${API_URL}/admin/categories/${category.id}`, category);
  }

  deleteCategory(id: number) {
    return this.http.delete<void>(`${API_URL}/admin/categories/${id}`);
  }

  adminGovernorates() {
    return this.http.get<ShippingGovernorate[]>(`${API_URL}/admin/shipping-governorates`);
  }

  saveGovernorate(governorate: Partial<ShippingGovernorate>) {
    return governorate.id
      ? this.http.put<ShippingGovernorate>(`${API_URL}/admin/shipping-governorates/${governorate.id}`, governorate)
      : this.http.post<ShippingGovernorate>(`${API_URL}/admin/shipping-governorates`, governorate);
  }

  deleteGovernorate(id: number) {
    return this.http.delete<void>(`${API_URL}/admin/shipping-governorates/${id}`);
  }

  expenses() {
    return this.http.get<Expense[]>(`${API_URL}/admin/finance/expenses`);
  }

  saveExpense(expense: Partial<Expense>) {
    return expense.id
      ? this.http.put<Expense>(`${API_URL}/admin/finance/expenses/${expense.id}`, expense)
      : this.http.post<Expense>(`${API_URL}/admin/finance/expenses`, expense);
  }

  deleteExpense(id: number) {
    return this.http.delete<void>(`${API_URL}/admin/finance/expenses/${id}`);
  }

  uploadImage(file: File) {
    const data = new FormData();
    data.append('file', file);
    return this.http.post<{ url: string; fileName: string }>(`${API_URL}/admin/uploads/images`, data);
  }
}
