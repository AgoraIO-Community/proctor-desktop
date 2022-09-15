import { AgoraCard } from "@/ui-kit/components/card";
import { SupervisorView } from "@/ui-kit/components/supervisor-view";

export const MainCameraView = () => {
  return (
    <AgoraCard>
      <SupervisorView tag="PC" video={<MainCamera />} />
    </AgoraCard>
  );
};

const MainCamera = () => {
  return <div style={{ height: "133px" }}>main camera</div>;
};
