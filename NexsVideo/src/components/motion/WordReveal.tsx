import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../../theme';

interface WordRevealProps {
  text: string;
  delay?: number;
  perWordFrames?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  className?: string;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  delay = 0,
  perWordFrames = 3,
  style,
  wordStyle,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '0.28em',
        ...style,
      }}
    >
      {words.map((word, i) => {
        const p = spring({
          frame: frame - delay - i * perWordFrames,
          fps,
          config: theme.spring.snappy,
        });

        const translateY = interpolate(p, [0, 1], [24, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translate3d(0, ${translateY}px, 0)`,
              willChange: 'transform, opacity',
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
