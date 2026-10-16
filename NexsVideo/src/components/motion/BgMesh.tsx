import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { theme } from '../../theme';

interface BgMeshProps {
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
}

export const BgMesh: React.FC<BgMeshProps> = ({
  primaryColor = theme.colors.primary,
  accentColor = theme.colors.accent,
  bgColor = theme.colors.bg,
}) => {
  const frame = useCurrentFrame();

  const d1 = Math.sin(frame / 60) * 60;
  const d2 = Math.cos(frame / 75) * 50;
  const d3 = Math.sin(frame / 90) * 40;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      {/* Primary Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          top: -400 + d3,
          left: -300 + d1,
          filter: 'blur(90px)',
          background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Accent Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          bottom: -350 - d2,
          right: -250 - d1,
          filter: 'blur(100px)',
          background: `radial-gradient(circle, ${accentColor}30 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Center Subtle Vignette Falloff */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(5,5,10,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
