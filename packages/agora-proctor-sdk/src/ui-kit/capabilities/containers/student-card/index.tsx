import "./index.css";
import { useEffect, useMemo } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import { LocalTrackPlayer, RemoteTrackPlayer } from "../stream/track-player";
import { observer } from "mobx-react";
import { EduStream, SceneType } from "agora-edu-core";
import { AgoraRteVideoSourceType } from "agora-rte-sdk";
export const StudentCard = observer(({ userUuid }: { userUuid: string }) => {
  const {
    layoutUIStore: { addStudentTab, videosWallLayout },
    subscriptionUIStore: { createSceneSubscription },
    roomUIStore: { joinClassroom, roomSceneByRoomUuid, leaveClassroom },
  } = useStore();
  const join = async () => {
    await joinClassroom(userUuid);

    if (scene?.scene) {
      createSceneSubscription(scene.scene);
      await scene.scene.joinRTC();
    }
  };
  useEffect(() => {
    join();
    return () => {
      leaveClassroom(userUuid);
    };
  }, []);
  const mainDeviceUserUuid = useMemo(() => userUuid + "-main", []);
  const subDeviceUserUuid = useMemo(() => userUuid + "-sub", []);
  const scene = useMemo(
    () => roomSceneByRoomUuid(userUuid),
    [roomSceneByRoomUuid, userUuid]
  );
  const screenShareStream = Array.from(
    scene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []
  ).find(
    (streamUuid) =>
      scene?.streamController?.streamByStreamUuid.get(streamUuid)
        ?.videoSourceType === AgoraRteVideoSourceType.ScreenShare
  );
  const cameraStream = Array.from(
    scene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []
  ).find(
    (streamUuid) =>
      scene?.streamController?.streamByStreamUuid.get(streamUuid)
        ?.videoSourceType === AgoraRteVideoSourceType.Camera
  );
  const mobileStream = Array.from(
    scene?.streamController?.streamByUserUuid.get(subDeviceUserUuid) || []
  ).find(
    (streamUuid) =>
      scene?.streamController?.streamByStreamUuid.get(streamUuid)
        ?.videoSourceType === AgoraRteVideoSourceType.Camera
  );
  return (
    <div
      className="fcr-student-card"
      onClick={() => addStudentTab("test", "test")}
    >
      <StudentVideos
        screenShareStream={scene?.streamController?.streamByStreamUuid?.get(
          screenShareStream || ""
        )}
        mobileStream={scene?.streamController?.streamByStreamUuid?.get(
          mobileStream || ""
        )}
        cameraStream={scene?.streamController?.streamByStreamUuid?.get(
          cameraStream || ""
        )}
        layout={videosWallLayout}
      />
      <div className="fcr-student-card-extra">
        <div className="fcr-student-card-user">
          <div className="fcr-student-card-user-avatar"></div>
          <div className="fcr-student-card-user-name">aaa</div>
        </div>
        <div className="fcr-student-card-actions">
          <div className="fcr-student-card-actions-like"></div>
          <div className="fcr-student-card-actions-chat"></div>
          <div className="fcr-student-card-actions-warning"></div>
        </div>
      </div>
    </div>
  );
});

export const StudentVideos = observer(
  ({
    layout,
    screenShareStream,
    cameraStream,
    mobileStream,
  }: {
    layout: VideosWallLayoutEnum;
    screenShareStream?: EduStream;
    cameraStream?: EduStream;
    mobileStream?: EduStream;
  }) => {
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? "fcr-student-card-videos-compact"
            : "fcr-student-card-videos-loose"
        }`}
      >
        <div className="fcr-student-card-videos-screen">
          {screenShareStream && (
            <RemoteTrackPlayer stream={screenShareStream}></RemoteTrackPlayer>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {cameraStream && (
            <RemoteTrackPlayer stream={cameraStream}></RemoteTrackPlayer>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {mobileStream && (
            <RemoteTrackPlayer stream={mobileStream}></RemoteTrackPlayer>
          )}
        </div>
      </div>
    );
  }
);
