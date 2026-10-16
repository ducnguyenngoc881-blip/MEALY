import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BgMesh } from './BgMesh';
import { ColorGrade } from './ColorGrade';
import { ProceduralGrain } from './ProceduralGrain';
import { Vignette } from './Vignette';

interface LayersProps {
  background?: React.ReactNode;
  media?: React.ReactNode;
  children: React.ReactNode; // Graphics, Typography, UI
  enableGrain?: boolean;
  enableVignette?: boolean;
  enableColorGrade?: boolean;
  grainOpacity?: number;
  vignetteDarkness?: number;
  gradeTint?: string;
  style?: React.CSSProperties;
}

/**
 * Standard 5-Layer Composition Stack:
 * 1. Background Mesh (Layer 1)
 * 2. Media / Raw Assets / Video (Layer 2)
 * 3. Typography & Graphics (Layer 3)
 * 4. Color Grade Overlay (Layer 4)
 * 5. Grain & Vignette (Layer 5)
 */
export const Layers: React.FC<LayersProps> = ({
  background = <BgMesh />,
  media,
  children,
  enableGrain = true,
  enableVignette = true,
  enableColorGrade = true,
  grainOpacity = 0.045,
  vignetteDarkness = 0.45,
  gradeTint,
  style,
}) => {
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      {/* Layer 1: Background Mesh */}
      {background}

      {/* Layer 2: Media Assets */}
      {media && <AbsoluteFill style={{ pointerEvents: 'none' }}>{media}</AbsoluteFill>}

      {/* Layer 3: Typography & Graphics (User Content) */}
      <AbsoluteFill>{children}</AbsoluteFill>

      {/* Layer 4: Color Grade */}
      {enableColorGrade && <ColorGrade tint={gradeTint} />}

      {/* Layer 5: Grain + Vignette */}
      {enableVignette && <Vignette darkness={vignetteDarkness} />}
      {enableGrain && <ProceduralGrain opacity={grainOpacity} />}
    </AbsoluteFill>
  );
};
