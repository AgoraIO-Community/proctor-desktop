import { AgoraCard } from '@proctor/capabilities/components/card';
import { SupervisorView } from '@proctor/capabilities/components/supervisor-view';
import { LocalTrackPlayer } from '../../common/stream/track-player';

export const MainCameraView = () => {
  return (
    <AgoraCard>
      <SupervisorView tag="PC" video={<MainCamera />} />
    </AgoraCard>
  );
};

const MainCamera = () => {
  return (
    <div style={{ height: '133px', background: 'F0F0F7' }}>
      <LocalTrackPlayer />
    </div>
  );
};
