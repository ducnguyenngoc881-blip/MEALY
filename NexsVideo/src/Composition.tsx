import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import { Slide1 } from './slides/Slide1';
import { Slide2 } from './slides/Slide2';
import { Slide3 } from './slides/Slide3';

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Sequence durationInFrames={150}>
        <Slide1 />
        <Audio src={staticFile("slide1.mp3")} />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <Slide2 />
        <Audio src={staticFile("slide2.mp3")} />
      </Sequence>
      <Sequence from={300} durationInFrames={150}>
        <Slide3 />
        <Audio src={staticFile("slide3.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};
