import { useStore } from "@/infra/hooks/ui-store";
import { Space } from "antd";
import { observer } from "mobx-react";
import styled, { css } from "styled-components";
import { RemoteTrackPlayer } from "../../common/stream/track-player";

export const InteractiveVideo = observer(() => {
  const {
    studentViewUIStore: { userAvatar },
    streamUIStore: { teacherCameraStream },
  } = useStore();
  return (
    <Space direction="vertical" size={15}>
      <StudentPhoto
        scale={!!teacherCameraStream ? 0.5 : 1}
        backgroundImage={userAvatar}
      />
      {teacherCameraStream &&
        (!teacherCameraStream?.isCameraMuted ||
          !teacherCameraStream.isMicMuted) && (
          <TeacherVideo>
            <RemoteTrackPlayer stream={teacherCameraStream.stream} />
          </TeacherVideo>
        )}
    </Space>
  );
});

const videoWidth = 193,
  videoHeight = 135;

const siderVideoBox = css`
  width: ${videoWidth}px;
  height: ${videoHeight}px;
  border-radius: 16px;
  background: #cecece;
`;

const StudentPhoto = styled.div<{ scale?: number; backgroundImage?: string }>`
  ${siderVideoBox}
  ${(props) =>
    props.scale &&
    css`
      width: ${videoWidth * props.scale}px;
      height: ${videoHeight * props.scale}px;
    `}
  ${(props) =>
    props.backgroundImage &&
    css`
      background: url(${props.backgroundImage});
      background-repeat: no-repeat;
      background-size: cover;
    `}
`;

const TeacherVideo = styled.div`
  ${siderVideoBox}
  ${css`
    overflow: hidden;
  `}
`;
