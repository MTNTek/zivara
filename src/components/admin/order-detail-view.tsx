interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string;
  lastFourDigits?: string | null;
  trackingNumber?: string | null;
  carrierName?: string | null;
  estimatedDeliveryDate?: Date | null;
  createdAt: Date;
  userId?: string | null;
  guestEmail?: string | null;
  items: OrderItem[];
}

interface OrderDetailViewProps {
  order: Order;
}

/**
 * Display complete order details for admin
 * Validates: Requirement 21.3
 */
export function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${parseFloat(item.priceAtPurchase).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">${parseFloat(order.shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customer Type</p>
              <p className="mt-1 text-base text-gray-900">
                {order.userId ? 'Registered User' : 'Guest'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-base text-gray-900">
                {order.guestEmail || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
        </div>
        <div className="p-6">
          <address className="not-italic text-gray-900">
            {order.shippingAddressLine1}
            <br />
            {order.shippingAddressLine2 && (
              <>
                {order.shippingAddressLine2}
                <br />
              </>
            )}
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
            <br />
            {order.shippingCountry}
          </address>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Method</p>
              <p className="mt-1 text-base text-gray-900 capitalize">
                {order.paymentMethod}
              </p>
            </div>
            {order.lastFourDigits && (
              <div>
                <p className="text-sm font-medium text-gray-500">Card</p>
                <p className="mt-1 text-base text-gray-900">
                  •••• •••• •••• {order.lastFourDigits}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {(order.trackingNumber || order.carrierName || order.estimatedDeliveryDate) && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.carrierName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Carrier</p>
                  <p className="mt-1 text-base text-gray-900">{order.carrierName}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                  <p className="mt-1 text-base text-gray-900">{order.trackingNumber}</p>
                </div>
              )}
              {order.estimatedDeliveryDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
