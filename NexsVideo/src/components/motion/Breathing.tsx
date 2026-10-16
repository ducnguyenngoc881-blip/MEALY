import React from 'react';
import { useCurrentFrame } from 'remotion';

interface BreathingProps {
  amplitude?: number; // max offset in px
  periodFrames?: number; // frames per cycle
  rotateDeg?: number; // subtle angle tilt
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Breathing: React.FC<BreathingProps> = ({
  amplitude = 5,
  periodFrames = 60,
  rotateDeg = 0.5,
  children,
  style,
}) => {
  const frame = useCurrentFrame();

  const translateY = Math.sin((frame * 2 * Math.PI) / periodFrames) * amplitude;
  const rotation = Math.cos((frame * 2 * Math.PI) / periodFrames) * rotateDeg;

  return (
    <div
      style={{
        transform: `translate3d(0, ${translateY}px, 0) rotate(${rotation}deg)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
