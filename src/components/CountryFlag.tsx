import React from 'react';

interface CountryFlagProps {
  countryId: string;
  className?: string;
  shape?: 'circle' | 'rounded' | 'square';
  title?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryId,
  className = 'w-6 h-6',
  shape = 'rounded',
  title,
}) => {
  const normId = (countryId || '').toLowerCase().trim();

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full overflow-hidden'
      : shape === 'rounded'
      ? 'rounded-md overflow-hidden'
      : 'overflow-hidden';

  // Authentic, pixel-perfect SVGs for GCC national flags
  // These render crisply on ALL devices including Windows 10/11 which lack emoji flags
  switch (normId) {
    case 'qatar':
    case 'qa':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'قطر'}>
          <svg viewBox="0 0 140 100" className="w-full h-full object-cover">
            {/* Qatar Flag: Maroon background with 9 white serrated points */}
            <rect width="140" height="100" fill="#8A1538" />
            <path
              d="M0,0 L40,0 L55,5.55 L40,11.11 L55,16.66 L40,22.22 L55,27.77 L40,33.33 L55,38.88 L40,44.44 L55,50 L40,55.55 L55,61.11 L40,66.66 L55,72.22 L40,77.77 L55,83.33 L40,88.88 L55,94.44 L40,100 L0,100 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'uae':
    case 'ae':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'الإمارات العربية المتحدة'}>
          <svg viewBox="0 0 120 80" className="w-full h-full object-cover">
            {/* UAE Flag: Green, White, Black horizontal with Red vertical hoist */}
            <rect width="120" height="26.67" y="0" fill="#00732F" />
            <rect width="120" height="26.67" y="26.67" fill="#FFFFFF" />
            <rect width="120" height="26.67" y="53.33" fill="#000000" />
            <rect width="30" height="80" x="0" y="0" fill="#FF0000" />
          </svg>
        </span>
      );

    case 'saudi':
    case 'sa':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'المملكة العربية السعودية'}>
          <svg viewBox="0 0 120 80" className="w-full h-full object-cover">
            {/* Saudi Arabia Flag: Rich green with Shahada script and sword */}
            <rect width="120" height="80" fill="#006C35" />
            {/* Simplified iconic sword & text representation in pure vector */}
            <path d="M26,38 Q60,35 94,38 Q90,30 60,31 Q30,30 26,38 Z" fill="#FFFFFF" opacity="0.95" />
            <rect x="35" y="46" width="50" height="4" rx="2" fill="#FFFFFF" />
            <polygon points="30,48 37,45 37,51" fill="#FFFFFF" />
            <rect x="83" y="44" width="3" height="8" rx="1.5" fill="#FFFFFF" />
            <circle cx="89" cy="48" r="2.5" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case 'kuwait':
    case 'kw':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'الكويت'}>
          <svg viewBox="0 0 120 80" className="w-full h-full object-cover">
            {/* Kuwait Flag: Green, White, Red horizontal with Black trapezoid */}
            <rect width="120" height="26.67" y="0" fill="#007A3D" />
            <rect width="120" height="26.67" y="26.67" fill="#FFFFFF" />
            <rect width="120" height="26.67" y="53.33" fill="#CE1126" />
            <polygon points="0,0 32,26.67 32,53.33 0,80" fill="#000000" />
          </svg>
        </span>
      );

    case 'oman':
    case 'om':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'سلطنة عُمان'}>
          <svg viewBox="0 0 120 80" className="w-full h-full object-cover">
            {/* Oman Flag: White, Red, Green with Red hoist and Khanjar emblem */}
            <rect width="120" height="26.67" y="0" fill="#FFFFFF" />
            <rect width="120" height="26.67" y="26.67" fill="#DB161B" />
            <rect width="120" height="26.67" y="53.33" fill="#008000" />
            <rect width="32" height="80" x="0" y="0" fill="#DB161B" />
            {/* White Khanjar dagger emblem in top canton */}
            <g transform="translate(16, 14) scale(0.4)" fill="#FFFFFF">
              <path d="M-10,-5 L10,-5 L8,15 L0,22 L-8,15 Z" />
              <line x1="-12" y1="-10" x2="12" y2="4" stroke="#FFFFFF" strokeWidth="3" />
              <line x1="12" y1="-10" x2="-12" y2="4" stroke="#FFFFFF" strokeWidth="3" />
            </g>
          </svg>
        </span>
      );

    case 'bahrain':
    case 'bh':
      return (
        <span className={`inline-flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 ${shapeClass} ${className}`} title={title || 'البحرين'}>
          <svg viewBox="0 0 120 80" className="w-full h-full object-cover">
            {/* Bahrain Flag: Red with 5 white serrated points */}
            <rect width="120" height="80" fill="#CE1126" />
            <path
              d="M0,0 L30,0 L45,8 L30,16 L45,24 L30,32 L45,40 L30,48 L45,56 L30,64 L45,72 L30,80 L0,80 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    case 'all':
    default:
      return (
        <span className={`inline-flex items-center justify-center shrink-0 bg-gradient-to-tr from-teal-700 to-emerald-500 text-white shadow-xs border border-teal-600/40 ${shapeClass} ${className}`} title={title || 'جميع دول الخليج'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5 text-white">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
      );
  }
};
