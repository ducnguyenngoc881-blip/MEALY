import { Composition } from 'remotion';
import { MainVideo } from './Composition';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Group1"
        component={MainVideo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
