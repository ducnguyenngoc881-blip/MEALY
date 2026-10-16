import React from 'react';
import { AbsoluteFill } from 'remotion';

interface ColorGradeProps {
  tint?: string;
  opacity?: number;
  blendMode?: React.CSSProperties['mixBlendMode'];
}

export const ColorGrade: React.FC<ColorGradeProps> = ({
  tint = '#7C3AED',
  opacity = 0.08,
  blendMode = 'color',
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        backgroundColor: tint,
        opacity,
        mixBlendMode: blendMode,
      }}
    />
  );
};
