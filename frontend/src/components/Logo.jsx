import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  linkTo = '/', 
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
        return '/images/logo/logo.svg';
      default:
        return '/images/logo/logo.png';
    }
  };

  const LogoContent = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={getLogoSrc()}
        alt="Pagejaune.cd Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && variant !== 'icon-only' && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Pagejaune.cd
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="transition-opacity hover:opacity-80">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
