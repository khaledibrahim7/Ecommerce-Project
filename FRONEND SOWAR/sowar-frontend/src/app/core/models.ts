export type Role = 'CUSTOMER' | 'ADMIN';
export type LoginType = 'EMAIL' | 'PHONE';
export type PromotionType = 'NONE' | 'DISCOUNT' | 'GIFT_PRODUCT';
export type OrderStatus = 'PLACED' | 'CONTACTING_CUSTOMER' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AddressRequest {
  governorateId: number;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  addressType?: AddressType;
  deliveryNotes?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ShippingGovernorate {
  id: number;
  name: string;
  shippingFee: number;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  weight?: string;
  ingredients?: string;
  usageInstructions?: string;
  storageInstructions?: string;
  origin?: string;
  featured: boolean;
  sortOrder: number;
  price: number;
  originalPrice?: number;
  // percentage value like 15 for 15% discount. Optional, admin-friendly field.
  discountPercent?: number;
  hasDiscount: boolean;
  cost?: number;
  promotionType: PromotionType;
  promotionTitle?: string;
  promotionDescription?: string;
  giftProductId?: number;
  giftProductName?: string;
  giftQuantity?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  lowStockAlertSent: boolean;
  active: boolean;
  categoryId?: number;
  categoryName?: string;
  imageUrls: string[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  hasDiscount: boolean;
  lineTotal: number;
  availableStock: number;
}

export interface Order {
  id: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  governorate: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  estimatedProfit: number;
  notes?: string;
  paymentMethod?: string;
  paid: boolean;
  items: OrderItem[];
  statusHistory: { status: OrderStatus; note: string; createdAt: string }[];
}

export interface CheckoutResponse {
  orderId: number;
  message: string;
  status: 'SUCCESS';
  orderDetails: Order;
  timestamp: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  hasDiscount: boolean;
  promotionType: PromotionType;
  promotionTitle?: string;
  giftProductName?: string;
  giftQuantity?: number;
  lineTotal: number;
}

export interface UserProfile {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: Role;
  address: AddressRequest & { governorateName?: string };
}

export interface Report {
  period: string;
  totalOrdersCount: number;
  activeOrdersCount: number;
  ordersCount?: number;
  cancelledOrdersCount: number;
  revenue: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Question {
  id: number;
  productId: number;
  productName: string;
  customerName?: string;
  question: string;
  answer?: string;
  answered: boolean;
  createdAt: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
}

export type ElectronicInvoiceStatus = 'PENDING_CONFIGURATION' | 'PENDING_SUBMISSION' | 'SUBMITTED' | 'FAILED';

export interface ElectronicInvoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: ElectronicInvoiceStatus;
  portalReference?: string;
  errorMessage?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface ContactLink {
  id?: number;
  label: string;
  platform: string;
  value: string;
  active: boolean;
  sortOrder: number;
}

export type NotificationType = 'NEW_ORDER' | 'ORDER_STATUS_CHANGED' | 'NEW_QUESTION' | 'QUESTION_ANSWERED' | 'LOW_STOCK';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl?: string;
  read: boolean;
  createdAt: string;
}
