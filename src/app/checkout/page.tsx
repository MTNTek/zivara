import { redirect } from 'next/navigation';
import { getCartSummary } from '@/features/cart/queries';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export default async function CheckoutPage() {
  const cartData = await getCartSummary();

  // Redirect to cart if empty
  if (cartData.items.length === 0) {
    redirect('/cart');
  }

  // Calculate totals
  const tax = cartData.subtotal * 0.1;
  const shipping = cartData.subtotal >= 50 ? 0 : 5;
  const total = cartData.subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              cartItems={cartData.items}
              subtotal={cartData.subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartData.totalQuantity} items)</span>
                  <span>${cartData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Items in Order</h3>
                <div className="space-y-2">
                  {cartData.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
