import React, { useState, useEffect } from 'react';
import { getOfflineFoodPlaceholder } from '../utils/offlineImage';
import { getDishImageUrl, FOOD_IMAGE_POOLS } from '../utils/dishImageResolver';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  dishTitle?: string;
  category?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackTitle,
  dishTitle,
  category = 'Món Ngon',
  className,
  onError,
  loading = 'lazy',
  ...rest
}) => {
  // Error fallback stage: 0 = primary/pre-flight, 1 = cluster fallback, 2 = guaranteed food pool fallback, 3 = offline cloche
  const [errorStage, setErrorStage] = useState(0);
  const title = dishTitle || fallbackTitle || alt || 'Món Ăn';

  // Invariant: React Rules of Hooks placed unconditionally at top of component body
  useEffect(() => {
    setErrorStage(0);
  }, [src, title, category]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (errorStage < 3) {
      setErrorStage(prev => prev + 1);
    }
    if (onError) {
      onError(e);
    }
  };

  // 4-Stage Resilient Fallback Cascade:
  let currentSrc: string;
  if (errorStage === 0) {
    // Stage 0: Pre-flight sanitized resolution using provided src if valid
    currentSrc = getDishImageUrl(title, category, src);
  } else if (errorStage === 1) {
    // Stage 1: Explicit semantic cluster resolution ignoring failing src
    currentSrc = getDishImageUrl(title, category);
  } else if (errorStage === 2) {
    // Stage 2: Guaranteed high-definition food pool fallback (pure food photo)
    const guaranteedPool = FOOD_IMAGE_POOLS['com_tam'] || FOOD_IMAGE_POOLS['banh_mi'] || [];
    currentSrc = guaranteedPool[0] || getOfflineFoodPlaceholder(title, category);
  } else {
    // Stage 3: Offline cloche (only reached if all online CDN attempts exhausted or truly offline)
    currentSrc = getOfflineFoodPlaceholder(title, category);
  }

  return (
    <img
      src={currentSrc}
      alt={alt || title}
      className={className}
      onError={handleError}
      loading={loading}
      {...rest}
    />
  );
};
