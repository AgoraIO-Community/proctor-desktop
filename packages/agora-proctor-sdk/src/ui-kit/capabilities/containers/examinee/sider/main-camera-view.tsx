import { AgoraCard } from "@/ui-kit/components/card";
import { SupervisorView } from "@/ui-kit/components/supervisor-view";
import { LocalTrackPlayer } from "../../common/stream/track-player";

export const MainCameraView = () => {
  return (
    <AgoraCard>
      <SupervisorView tag="PC" video={<MainCamera />} />
    </AgoraCard>
  );
};

const MainCamera = () => {
  return (
    <div style={{ height: "133px" }}>
      <LocalTrackPlayer />
    </div>
  );
};
