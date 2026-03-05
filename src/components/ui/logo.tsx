import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ 
  className = '', 
  variant = 'light', 
  showText = true,
  size = 'md' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const iconColor = variant === 'light' ? '#ffffff' : '#0d9488';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Shopping bag with Z */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shopping bag outline */}
        <path
          d="M38 14H10L8 42H40L38 14Z"
          fill={variant === 'light' ? '#0d9488' : '#14b8a6'}
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Bag handles */}
        <path
          d="M14 14C14 14 14 8 24 8C34 8 34 14 34 14"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter Z inside bag */}
        <path
          d="M18 24H30L18 34H30"
          stroke={variant === 'light' ? '#ffffff' : '#065f46'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-2xl ${textColor} tracking-tight`}>
            Zivara
          </span>
          <span className={`text-xs ${variant === 'light' ? 'text-gray-300' : 'text-gray-500'} tracking-wider`}>
            SHOP SMART
          </span>
        </div>
      )}
    </div>
  );
}

// Icon-only version for compact spaces
export function LogoIcon({ 
  className = '', 
  variant = 'light',
  size = 'md'
}: Omit<LogoProps, 'showText'>) {
  return <Logo className={className} variant={variant} showText={false} size={size} />;
}
