'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItemWithProduct } from '@/features/cart/queries';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemWithProduct[];
  subtotal: number;
}

export function CartDrawer({ isOpen, onClose, items, subtotal }: CartDrawerProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Shopping Cart
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
                        aria-label="Close cart"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {items.length > 0 ? (
                        <div className="space-y-4">
                          {items.map((item) => {
                            const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                            return (
                              <div key={item.id} className="flex gap-4">
                                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {primaryImage ? (
                                    <Image
                                      src={primaryImage.thumbnailUrl || primaryImage.imageUrl}
                                      alt={item.product.name}
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/products/${item.product.id}`}
                                    onClick={onClose}
                                    className="font-medium text-gray-900 hover:text-teal-600 line-clamp-2"
                                  >
                                    {item.product.name}
                                  </Link>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Qty: {item.quantity}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 mt-1">
                                    ${(parseFloat(item.priceAtAdd) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="text-gray-600">Your cart is empty</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex justify-between text-lg font-semibold text-gray-900 mb-4">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={onClose}
                          className="block w-full bg-teal-600 text-white text-center px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-teal-700 transition-colors mb-2 flex items-center justify-center"
                        >
                          View Cart
                        </Link>
                        <Link
                          href="/checkout"
                          onClick={onClose}
                          className="block w-full bg-gray-900 text-white text-center px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                          Checkout
                        </Link>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
