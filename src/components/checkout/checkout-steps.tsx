interface CheckoutStepsProps {
  currentStep: 'cart' | 'shipping' | 'payment' | 'review';
}

const steps = [
  { key: 'cart', label: 'Cart' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
] as const;

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <nav aria-label="Checkout progress" className="mb-6">
      <ol className="flex items-center justify-between max-w-lg mx-auto">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-[#007600] text-white'
                      : isCurrent
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-gray-200 text-[#565959]'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`mt-1 text-[11px] ${isCurrent ? 'text-[#2563eb] font-semibold' : 'text-[#565959]'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-14px] ${i < currentIndex ? 'bg-[#007600]' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
