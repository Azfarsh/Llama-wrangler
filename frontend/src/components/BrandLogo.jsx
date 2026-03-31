import React from 'react';
import AxelLogo from '../assets/Axel_logo.png';

const SIZE_SCALE = {
  xs: 40,
  sm: 48,
  md: 56,
  lg: 68,
  xl: 84,
  hero: 142,
};

export default function BrandLogo({ size = 'md', className = '', alt = 'Axel AI' }) {
  const resolved = typeof size === 'string' && SIZE_SCALE[size] ? SIZE_SCALE[size] : size;
  const px = typeof resolved === 'number' ? `${resolved}px` : resolved;
  return (
    <img
      src={AxelLogo}
      alt={alt}
      className={`object-contain ${className}`}
      style={{
        width: px,
        height: px,
        display: 'block',
        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.28))',
      }}
    />
  );
}

