import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  itemCount?: number;
  totalQuantity: number;
}

export function CartSummary({ subtotal, totalQuantity }: CartSummaryProps) {
  // Calculate estimated tax (example: 10%)
  const tax = subtotal * 0.1;
  
  // Calculate shipping (free over $50, otherwise $5)
  const shipping = subtotal >= 50 ? 0 : 5;
  
  // Calculate total
  const total = subtotal + tax + shipping;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({totalQuantity} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        {subtotal < 50 && (
          <p className="text-sm text-teal-600">
            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </p>
        )}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-teal-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors mb-3"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/products"
        className="block w-full text-center text-teal-600 hover:text-teal-700 font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
