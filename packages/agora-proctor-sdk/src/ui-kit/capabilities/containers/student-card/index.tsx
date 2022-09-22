import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import { LocalTrackPlayer, RemoteTrackPlayer } from "../stream/track-player";
import { observer } from "mobx-react";
import {
  EduClassroomConfig,
  EduRoomTypeEnum,
  EduStream,
  SceneType,
} from "agora-edu-core";
import { AgoraRteScene, AgoraRteVideoSourceType } from "agora-rte-sdk";
import { SvgIconEnum, SvgImg } from "~ui-kit";
export const StudentCard = observer(({ userUuid }: { userUuid: string }) => {
  const {
    layoutUIStore: { addStudentTab },
    subscriptionUIStore: { createSceneSubscription },
    usersUIStore: { videosWallLayout, focusUser },
    roomUIStore: { joinClassroom, roomSceneByRoomUuid, leaveClassroom },
    classroomStore: {
      userStore: { studentList },
    },
  } = useStore();
  const [joinSuccess, setJoinSuccess] = useState(false);
  const scene = roomSceneByRoomUuid(userUuid);

  const join = async () => {
    const roomScene = await joinClassroom(userUuid, EduRoomTypeEnum.RoomGroup);
    if (roomScene?.scene) {
      await roomScene.scene.joinRTC();
      setJoinSuccess(true);
    }
  };
  useEffect(() => {
    join();
    return () => {
      leaveClassroom(userUuid);
    };
  }, []);
  const mainDeviceUserUuid = useMemo(
    () => userUuid.split("-")[0] + "-main",
    []
  );
  const subDeviceUserUuid = useMemo(() => userUuid.split("-")[0] + "-sub", []);
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
  const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

  const focus = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await focusUser(
      EduClassroomConfig.shared.sessionInfo.roomUuid,
      mainDeviceUserUuid,
      {
        focus:
          mainDeviceStudent?.userProperties?.get("tags")?.focus === 1 ? 0 : 1,
      }
    );
  };
  return (
    <div
      className="fcr-student-card"
      onClick={() => addStudentTab("test", "test")}
    >
      {joinSuccess && (
        <StudentVideos
          fromScene={scene?.scene}
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
      )}
      <div className="fcr-student-card-extra">
        <div className="fcr-student-card-user">
          <div className="fcr-student-card-user-avatar">
            <img src={mainDeviceStudent?.userProperties?.flex?.avatar} />
          </div>
          <div className="fcr-student-card-user-name">
            {mainDeviceStudent?.userName}
          </div>
        </div>
        <div className="fcr-student-card-actions">
          <div className="fcr-student-card-actions-like" onClick={focus}>
            <SvgImg
              type={SvgIconEnum.FAV}
              colors={{
                iconPrimary:
                  mainDeviceStudent?.userProperties?.get("tags")?.focus === 1
                    ? "#FF5474"
                    : "#63626F",
              }}
            ></SvgImg>
          </div>
          <div className="fcr-student-card-actions-chat">
            <SvgImg type={SvgIconEnum.CHAT}></SvgImg>
          </div>
          <div className="fcr-student-card-actions-warning">
            <SvgImg type={SvgIconEnum.MESSAGE_NORMAL}></SvgImg>
          </div>
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
    fromScene,
  }: {
    layout: VideosWallLayoutEnum;
    screenShareStream?: EduStream;
    cameraStream?: EduStream;
    mobileStream?: EduStream;
    fromScene?: AgoraRteScene;
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
            <RemoteTrackPlayer
              fromScene={fromScene}
              stream={screenShareStream}
            ></RemoteTrackPlayer>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {cameraStream && (
            <RemoteTrackPlayer
              fromScene={fromScene}
              stream={cameraStream}
            ></RemoteTrackPlayer>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {mobileStream && (
            <RemoteTrackPlayer
              fromScene={fromScene}
              stream={mobileStream}
            ></RemoteTrackPlayer>
          )}
        </div>
      </div>
    );
  }
);
