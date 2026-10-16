import React from 'react';
import { AbsoluteFill } from 'remotion';

interface VignetteProps {
  darkness?: number; // 0 to 1
  innerRadius?: number; // percent
}

export const Vignette: React.FC<VignetteProps> = ({
  darkness = 0.5,
  innerRadius = 40,
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent ${innerRadius}%, rgba(0, 0, 0, ${darkness}) 100%)`,
      }}
    />
  );
};
