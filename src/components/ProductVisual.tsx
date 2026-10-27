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
  const resolvedUrl = resolveMediaUrl(imageUrl);

  const heightClass = size === 'sm' ? 'h-24' : size === 'lg' ? 'h-80' : 'h-48';

  if (resolvedUrl && !imgError) {
    return (
      <div
        className={`relative overflow-hidden bg-[#181817] select-none group ${heightClass} ${className}`}
      >
        <img
          src={resolvedUrl}
          alt={name}
          width={800}
          height={600}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {size !== 'sm' && galleryCount > 1 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141413] text-[#f5f4f0] text-[13px] font-medium tnum">
            {galleryCount} Views
          </div>
        )}
        {size === 'lg' && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[13px] text-[#f5f4f0] bg-[#141413] px-3 py-1.5 tnum">
            <span className="truncate font-medium">{sku || brand || 'Verified Wholesale Lot'}</span>
            {hsnCode && <span className="text-[#c9a45a] font-medium">HSN {hsnCode}</span>}
          </div>
        )}
      </div>
    );
  }

  const text = `${sku ?? ''} ${name} ${categoryName ?? ''}`.toLowerCase();
  const isRiceOrGrain = text.includes('rice') || text.includes('basmati') || text.includes('grain') || text.includes('agro');
  const isOil = text.includes('oil') || text.includes('sunflower') || text.includes('can');
  const isCable = text.includes('cable') || text.includes('wire') || text.includes('armoured') || text.includes('copper');
  const isLighting = text.includes('led') || text.includes('highbay') || text.includes('luminaire') || text.includes('light');

  const bgTone = isCable
    ? 'bg-[#1f1916]'
    : isLighting
    ? 'bg-[#161c24]'
    : isRiceOrGrain
    ? 'bg-[#1c1a14]'
    : isOil
    ? 'bg-[#141f1a]'
    : 'bg-[#181817]';

  return (
    <div
      className={`relative overflow-hidden ${bgTone} text-[#f5f4f0] flex flex-col justify-between p-4 select-none group ${heightClass} ${className}`}
    >
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 text-[13px] font-medium bg-[#262624] text-[#e4e2dd] truncate max-w-[65%]">
          {brand || categoryName || 'Factory Direct'}
        </span>
        {hsnCode && size !== 'sm' && (
          <span className="px-2 py-0.5 text-[13px] bg-[#262624] text-[#c9a45a] tnum">
            HSN {hsnCode}
          </span>
        )}
      </div>

      <div className="relative z-10 my-auto flex items-center justify-center py-2">
        <div className="w-16 h-16 bg-[#262624] flex items-center justify-center text-sm font-semibold text-[#c9a45a] tnum transition-transform duration-300 ease-out group-hover:scale-105">
          {sku ? sku.slice(0, 8) : 'B2B SKU'}
        </div>
      </div>

      {size !== 'sm' && (
        <div className="relative z-10 flex items-center justify-between text-[13px] text-[#a3a19a] pt-2 tnum">
          <span className="truncate max-w-[65%]">{sku || 'Verified Lot'}</span>
          {packSize ? (
            <span className="font-medium text-[#f5f4f0]">
              Pack: {packSize} {unit}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
