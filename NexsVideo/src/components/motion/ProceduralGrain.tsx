import React from 'react';
import { AbsoluteFill } from 'remotion';

interface ProceduralGrainProps {
  opacity?: number;
}

export const ProceduralGrain: React.FC<ProceduralGrainProps> = ({ opacity = 0.045 }) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </AbsoluteFill>
  );
};
