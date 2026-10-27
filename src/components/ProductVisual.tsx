import React, { useState } from 'react';
import { resolveMediaUrl } from '../lib/api';

interface ProductVisualProps {
  sku?: string | null;
  name: string;
  categoryName?: string | null;
  brand?: string | null;
  hsnCode?: string | null;
  packSize?: number | null;
  unit?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string | null;
  galleryCount?: number;
  primaryColor?: string;
  accentColor?: string;
}

function getFallbackCommercialPhoto(sku: string, name: string, categoryName: string): string {
  const text = `${sku} ${name} ${categoryName}`.toLowerCase();
  if (text.includes('rice') || text.includes('basmati') || text.includes('grain')) {
    return '/uploads/demo/ff-basmati-primary.jpg';
  }
  if (text.includes('oil') || text.includes('sunflower') || text.includes('groundnut') || text.includes('mustard') || text.includes('tin')) {
    return '/uploads/demo/ff-oil-primary.jpg';
  }
  if (text.includes('cable') || text.includes('wire') || text.includes('copper') || text.includes('xlpe') || text.includes('coil')) {
    return '/uploads/demo/acme-cable-primary.jpg';
  }
  if (text.includes('led') || text.includes('highbay') || text.includes('high-bay') || text.includes('luminaire') || text.includes('light')) {
    return '/uploads/demo/acme-led-primary.jpg';
  }
  return '/uploads/demo/acme-mcb-primary.jpg';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  sku = '',
  name,
  categoryName = '',
  brand = '',
  hsnCode = '',
  packSize,
  unit = 'pcs',
  className = '',
  size = 'md',
  imageUrl,
  galleryCount = 0,
}) => {
  const [imgError, setImgError] = useState(false);
  const fallbackPhoto = getFallbackCommercialPhoto(sku || '', name || '', categoryName || '');
  const resolvedUrl = resolveMediaUrl(imageUrl) || fallbackPhoto;
  const activeSrc = imgError ? fallbackPhoto : resolvedUrl;

  const heightClass = size === 'sm' ? 'h-24' : size === 'lg' ? 'h-80' : 'h-48';

  return (
    <div
      className={`relative overflow-hidden bg-[#f5f4f0] select-none group ${heightClass} ${className}`}
    >
      <img
        src={activeSrc}
        alt={name}
        width={800}
        height={600}
        loading="lazy"
        onError={() => {
          if (!imgError) setImgError(true);
        }}
        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {size !== 'sm' && galleryCount > 1 && (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#141413]/90 text-[#f5f4f0] text-[12px] font-semibold tnum">
          {galleryCount} Real Photos
        </div>
      )}
      {size !== 'sm' && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 text-[12px] text-[#f5f4f0] bg-[#141413]/90 px-2.5 py-1 tnum">
          <span className="truncate font-semibold">{sku || brand || 'Verified Wholesale SKU'}</span>
          {packSize ? (
            <span className="text-[#a1ffcb] font-semibold shrink-0">
              Pack: {packSize} {unit}
            </span>
          ) : hsnCode ? (
            <span className="text-[#c9a45a] font-semibold shrink-0">HSN {hsnCode}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};
