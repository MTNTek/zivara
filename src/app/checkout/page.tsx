import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCartSummary } from '@/features/cart/queries';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { MobileOrderSummary } from '@/components/checkout/mobile-order-summary';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Checkout - Zivara',
  description: 'Complete your purchase securely.',
};

export default async function CheckoutPage() {
  const cartData = await getCartSummary();

  if (cartData.items.length === 0) {
    redirect('/cart');
  }

  const tax = cartData.subtotal * 0.1;
  const shipping = cartData.subtotal >= 50 ? 0 : 5;
  const total = cartData.subtotal + tax + shipping;

  // Calculate total savings from discounted items
  const totalSavings = cartData.items.reduce((acc, item) => {
    const originalPrice = Number(item.product.price);
    const paidPrice = Number(item.priceAtAdd);
    if (paidPrice < originalPrice) {
      return acc + (originalPrice - paidPrice) * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-[#0F1111]">Checkout</h1>
          <span className="text-sm text-[#565959]">({cartData.totalQuantity} {cartData.totalQuantity === 1 ? 'item' : 'items'})</span>
        </div>

        {/* Savings banner */}
        {totalSavings > 0 && (
          <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#007600] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm text-[#007600]">
              You&apos;re saving <span className="font-bold">${totalSavings.toFixed(2)}</span> on this order with current deals
            </p>
          </div>
        )}

        <CheckoutSteps currentStep="shipping" />

        <MobileOrderSummary
          subtotal={cartData.subtotal}
          tax={tax}
          shipping={shipping}
          total={total}
          itemCount={cartData.totalQuantity}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckoutForm
              cartItems={cartData.items}
              subtotal={cartData.subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
            />
          </div>

          <div className="lg:col-span-1">
            <CheckoutOrderSummary subtotal={cartData.subtotal} itemCount={cartData.totalQuantity}>
              {/* Items Preview */}
              <div className="border-t border-[#e7e7e7] pt-4">
                <h3 className="text-sm font-semibold text-[#0F1111] mb-3">Items in Order</h3>
                <div className="space-y-3">
                  {cartData.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0]?.imageUrl ? (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 bg-[#2563eb] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#0F1111] line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-[#565959]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm text-[#0F1111] font-medium flex-shrink-0">
                        ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-[#e7e7e7] pt-4 mt-4">
                <div className="flex flex-col gap-2 text-xs text-[#565959]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>30-day return guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Powered by Stripe</span>
                  </div>
                </div>
              </div>
            </CheckoutOrderSummary>
          </div>
        </div>
      </div>
    </div>
  );
}
