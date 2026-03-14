'use client';

interface StatusHistoryEntry {
  status: string;
  createdAt: string | Date;
  notes?: string | null;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  subtotal: string;
}

interface OrderData {
  orderNumber: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  estimatedDeliveryDate?: string | Date | null;
  trackingNumber?: string | null;
  carrierName?: string | null;
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
  statusHistory?: StatusHistoryEntry[];
  items?: OrderItem[];
  [key: string]: unknown;
}

/**
 * Order tracking view component
 * Validates: Requirements 23.1-23.7
 */
export default function OrderTrackingView({ order }: { order: OrderData }) {
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Calculate estimated delivery date based on status
  const getEstimatedDelivery = () => {
    if (order.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate);
    }

    // Default estimates based on status
    const createdDate = new Date(order.createdAt);
    switch (order.status) {
      case 'pending':
      case 'processing':
        return new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'shipped':
        return new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'delivered':
        return new Date(order.updatedAt);
      default:
        return null;
    }
  };

  const estimatedDelivery = getEstimatedDelivery();

  // Status timeline configuration
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📦' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Track Your Order
        </h1>
        <p className="text-gray-600">
          Order Number: <span className="font-semibold">{order.orderNumber}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Placed {formatRelativeTime(new Date(order.createdAt))}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Order Status
        </h2>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const statusHistory = order.statusHistory?.find(
                (h: StatusHistoryEntry) => h.status === step.key
              );

              return (
                <div key={step.key} className="relative flex items-start">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                      isCompleted
                        ? 'bg-blue-800 text-white'
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                  >
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {statusHistory && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(statusHistory.createdAt).toLocaleString()}
                      </p>
                    )}
                    {statusHistory?.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {statusHistory.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancelled Status */}
        {order.status === 'cancelled' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Order Cancelled
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estimated Delivery */}
      {estimatedDelivery && order.status !== 'cancelled' && order.status !== 'delivered' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Estimated Delivery
          </h3>
          <p className="text-blue-800">
            {estimatedDelivery.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Tracking Information */}
      {order.trackingNumber && order.carrierName && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shipping Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Carrier:</span>
              <span className="font-semibold text-gray-900">
                {order.carrierName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Number:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {order.trackingNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Items
        </h3>
        <div className="space-y-4">
          {order.items?.map((item: OrderItem) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.productName}</h4>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">
                ${parseFloat(order.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">
                ${parseFloat(order.tax).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">
                ${parseFloat(order.shipping).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-black">
                ${parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Address
        </h3>
        <div className="text-gray-700">
          <p>{order.shippingAddressLine1}</p>
          {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
          <p>
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
          </p>
          <p>{order.shippingCountry}</p>
        </div>
      </div>
    </div>
  );
}
