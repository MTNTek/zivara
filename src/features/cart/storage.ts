'use client';

/**
 * Client-side cart storage for guest users
 * Validates: Requirements 5.8, 22.2
 */

export interface GuestCartItem {
  productId: string;
  quantity: number;
  priceAtAdd: string;
  addedAt: string; // ISO date string
}

const CART_STORAGE_KEY = 'zivara_guest_cart';

/**
 * Get guest cart from local storage
 * 
 * @returns Array of guest cart items
 */
export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const items = JSON.parse(stored) as GuestCartItem[];
    
    // Filter out items older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const validItems = items.filter(item => {
      const addedDate = new Date(item.addedAt);
      return addedDate > thirtyDaysAgo;
    });

    // Update storage if items were filtered
    if (validItems.length !== items.length) {
      saveGuestCart(validItems);
    }

    return validItems;
  } catch (error) {
    console.error('Error reading guest cart from storage:', error);
    return [];
  }
}

/**
 * Save guest cart to local storage
 * 
 * @param items - Cart items to save
 */
export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving guest cart to storage:', error);
  }
}

/**
 * Add item to guest cart
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to add
 * @param price - Current product price
 */
export function addToGuestCart(
  productId: string,
  quantity: number,
  price: string
): void {
  const cart = getGuestCart();
  
  // Check if item already exists
  const existingIndex = cart.findIndex(item => item.productId === productId);
  
  if (existingIndex >= 0) {
    // Update quantity (max 99)
    const newQuantity = Math.min(cart[existingIndex].quantity + quantity, 99);
    cart[existingIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.push({
      productId,
      quantity: Math.min(quantity, 99),
      priceAtAdd: price,
      addedAt: new Date().toISOString(),
    });
  }
  
  saveGuestCart(cart);
}

/**
 * Update guest cart item quantity
 * 
 * @param productId - Product ID
 * @param quantity - New quantity
 */
export function updateGuestCartItem(
  productId: string,
  quantity: number
): void {
  const cart = getGuestCart();
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex >= 0) {
    cart[itemIndex].quantity = Math.min(Math.max(quantity, 1), 99);
    saveGuestCart(cart);
  }
}

/**
 * Remove item from guest cart
 * 
 * @param productId - Product ID to remove
 */
export function removeFromGuestCart(productId: string): void {
  const cart = getGuestCart();
  const filtered = cart.filter(item => item.productId !== productId);
  saveGuestCart(filtered);
}

/**
 * Clear guest cart
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
}

/**
 * Get guest cart item count
 * 
 * @returns Total quantity of items in guest cart
 */
export function getGuestCartCount(): number {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}
