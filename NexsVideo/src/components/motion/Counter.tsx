import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../../theme';

interface CounterProps {
  from?: number;
  to: number;
  delay?: number;
  durationFrames?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  delay = 0,
  durationFrames,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let currentValue = from;

  if (durationFrames) {
    const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
      easing: theme.ease.out,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    currentValue = from + (to - from) * progress;
  } else {
    const progress = spring({
      frame: frame - delay,
      fps,
      config: theme.spring.smooth,
    });
    currentValue = interpolate(progress, [0, 1], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const formatted = decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toLocaleString();

  return (
    <span className={className} style={{ ...style }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
