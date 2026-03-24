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
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const fillColor = variant === 'light' ? '#ffffff' : '#1e3a5f';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Zivara Z Icon — geometric Z with diagonal stripes */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Top bar */}
        <polygon points="15,12 85,12 80,22 15,22" fill={fillColor}/>
        {/* Bottom bar */}
        <polygon points="20,78 85,78 85,88 15,88" fill={fillColor}/>
        {/* Diagonal stripe 1 */}
        <polygon points="22,22 30,22 20,78 12,78" fill={fillColor}/>
        {/* Diagonal stripe 2 */}
        <polygon points="38,22 46,22 36,78 28,78" fill={fillColor}/>
        {/* Diagonal stripe 3 */}
        <polygon points="54,22 62,22 52,78 44,78" fill={fillColor}/>
        {/* Diagonal stripe 4 */}
        <polygon points="70,22 78,22 68,78 60,78" fill={fillColor}/>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-2xl ${textColor} tracking-tight`}>
            Zivara
          </span>
          <span className={`text-[10px] ${variant === 'light' ? 'text-blue-200' : 'text-gray-500'} tracking-[0.2em] uppercase`}>
            Shop Smart
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
