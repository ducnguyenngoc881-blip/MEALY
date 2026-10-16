import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../../theme';

interface EntranceProps {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  scaleFrom?: number;
  preset?: keyof typeof theme.spring;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Entrance: React.FC<EntranceProps> = ({
  delay = 0,
  direction = 'up',
  distance = 36,
  scaleFrom = 0.94,
  preset = 'snappy',
  children,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: theme.spring[preset] || theme.spring.snappy,
  });

  let translateX = 0;
  let translateY = 0;

  if (direction === 'up') {
    translateY = interpolate(progress, [0, 1], [distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (direction === 'down') {
    translateY = interpolate(progress, [0, 1], [-distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (direction === 'left') {
    translateX = interpolate(progress, [0, 1], [distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (direction === 'right') {
    translateX = interpolate(progress, [0, 1], [-distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const scale = interpolate(progress, [0, 1], [scaleFrom, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className={className}
      style={{
        opacity: progress,
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
