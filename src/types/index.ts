import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Inferred types from schema
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Product = InferSelectModel<typeof schema.products>;
export type NewProduct = InferInsertModel<typeof schema.products>;

export type Category = InferSelectModel<typeof schema.categories>;
export type NewCategory = InferInsertModel<typeof schema.categories>;

export type ProductImage = InferSelectModel<typeof schema.productImages>;
export type NewProductImage = InferInsertModel<typeof schema.productImages>;

export type Inventory = InferSelectModel<typeof schema.inventory>;
export type NewInventory = InferInsertModel<typeof schema.inventory>;

export type Order = InferSelectModel<typeof schema.orders>;
export type NewOrder = InferInsertModel<typeof schema.orders>;

export type OrderItem = InferSelectModel<typeof schema.orderItems>;
export type NewOrderItem = InferInsertModel<typeof schema.orderItems>;

export type Review = InferSelectModel<typeof schema.reviews>;
export type NewReview = InferInsertModel<typeof schema.reviews>;

export type CartItem = InferSelectModel<typeof schema.cartItems>;
export type NewCartItem = InferInsertModel<typeof schema.cartItems>;

export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof schema.auditLogs>;

// Extended types with relations
export type ProductWithDetails = Product & {
  category: Category;
  images: ProductImage[];
  inventory: Inventory | null;
};

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithImages;
};

// Enums
export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Form data types
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryParams extends ProductFilters, PaginationParams {}
