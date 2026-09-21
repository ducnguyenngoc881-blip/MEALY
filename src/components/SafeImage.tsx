import React, { useState, useEffect } from 'react';
import { getOfflineFoodPlaceholder } from '../utils/offlineImage';
import { getDishImageUrl } from '../utils/dishImageResolver';

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
  const [hasError, setHasError] = useState(false);
  const title = dishTitle || fallbackTitle || alt || 'Món Ăn';

  // Reset error state when image source or dish title changes
  useEffect(() => {
    setHasError(false);
  }, [src, title]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  // Semantically optimize image to match dish title & category
  const resolvedSrc = getDishImageUrl(title, category, src);
  const currentSrc = hasError || !resolvedSrc ? getOfflineFoodPlaceholder(title, category) : resolvedSrc;

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
