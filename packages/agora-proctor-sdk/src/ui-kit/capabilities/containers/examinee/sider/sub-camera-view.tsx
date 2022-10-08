import { AgoraCard } from "@/ui-kit/components/card";
import { SupervisorView } from "@/ui-kit/components/supervisor-view";

export const SubCameraView = () => {
  return (
    <AgoraCard>
      <SupervisorView tag="Phone" video={<SubCamera />} />
    </AgoraCard>
  );
};

const SubCamera = () => {
  return <div style={{ height: "133px" }}>sub camera</div>;
};
