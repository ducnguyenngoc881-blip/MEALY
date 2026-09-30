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
  const [retryWithResolver, setRetryWithResolver] = useState(false);
  const title = dishTitle || fallbackTitle || alt || 'Món Ăn';

  // Reset error state when image source or dish title changes
  useEffect(() => {
    setHasError(false);
    setRetryWithResolver(false);
  }, [src, title]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!retryWithResolver) {
      // First attempt: try semantic resolver without using the failing src
      setRetryWithResolver(true);
    } else if (!hasError) {
      // Second failure: truly offline or network unavailable, fall back to offline cloche
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  // Semantically optimize image to match dish title & category
  const initialResolved = getDishImageUrl(title, category, src);
  const dynamicFallback = getDishImageUrl(title, category);

  const currentSrc = hasError || (!initialResolved && !dynamicFallback)
    ? getOfflineFoodPlaceholder(title, category)
    : retryWithResolver
    ? dynamicFallback
    : initialResolved;

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
