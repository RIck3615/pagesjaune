import React from 'react';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'default' // 'default', 'small', 'icon-only'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const getLogoSrc = () => {
    switch (variant) {
      case 'small':
        return '/images/logo/logo-small.png';
      case 'icon-only':
        return '/images/logo/logo.png';
      default:
        return '/images/logo/logo.png';
    }
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src={getLogoSrc()} 
        alt="Page Jaune Logo" 
        className="object-contain w-full h-full"
      />
    </div>
  );

  if (variant === 'icon-only') {
    return <LogoIcon />;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoIcon />
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Pagejaune.cd
        </span>
      )}
    </div>
  );
};

export default Logo;
