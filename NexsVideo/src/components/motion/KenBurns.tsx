import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../../theme';

interface KenBurnsProps {
  scaleFrom?: number;
  scaleTo?: number;
  panX?: number; // pixels
  panY?: number; // pixels
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const KenBurns: React.FC<KenBurnsProps> = ({
  scaleFrom = 1.0,
  scaleTo = 1.08,
  panX = -15,
  panY = -10,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, scaleTo], {
    easing: theme.ease.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const x = interpolate(frame, [0, durationInFrames], [0, panX], {
    easing: theme.ease.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [0, durationInFrames], [0, panY], {
    easing: theme.ease.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: `scale(${scale}) translate3d(${x}px, ${y}px, 0)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
