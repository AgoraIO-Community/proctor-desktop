import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import {
  LocalTrackPlayer,
  RemoteTrackPlayer,
  RemoteTrackPlayerWithFullScreen,
} from "../stream/track-player";
import { observer } from "mobx-react";
import {
  EduClassroomConfig,
  EduRoomTypeEnum,
  EduStream,
  SceneType,
} from "agora-edu-core";
import { AgoraRteScene, AgoraRteVideoSourceType } from "agora-rte-sdk";
import { SvgIconEnum, SvgImg } from "~ui-kit";
export const StudentCard = observer(
  ({ userUuid, renderVideos }: { userUuid: string; renderVideos: boolean }) => {
    const {
      layoutUIStore: { addStudentTab },
      usersUIStore: { videosWallLayout, focusUser },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();

    const mainDeviceUserUuid = useMemo(
      () => userUuid.split("-")[0] + "-main",
      []
    );

    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

    const focus: React.MouseEventHandler = async (e) => {
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
        onClick={() =>
          addStudentTab(userUuid, mainDeviceStudent?.userName || "student")
        }
      >
        {renderVideos && (
          <StudentVideos userUuid={userUuid} layout={videosWallLayout} />
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
  }
);

export const StudentVideos = observer(
  ({
    layout,
    userUuid,
  }: {
    layout: VideosWallLayoutEnum;
    userUuid: string;
  }) => {
    const {
      roomUIStore: { joinClassroom, roomSceneByRoomUuid, leaveClassroom },
    } = useStore();
    const [joinSuccess, setJoinSuccess] = useState(false);
    const scene = roomSceneByRoomUuid(userUuid);

    const join = async () => {
      const roomScene = await joinClassroom(
        userUuid,
        EduRoomTypeEnum.RoomGroup
      );
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
    const subDeviceUserUuid = useMemo(
      () => userUuid.split("-")[0] + "-sub",
      []
    );
    const screenShareStreamUuid = Array.from(
      scene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []
    ).find(
      (streamUuid) =>
        scene?.streamController?.streamByStreamUuid.get(streamUuid)
          ?.videoSourceType === AgoraRteVideoSourceType.ScreenShare
    );
    const screenShareStream =
      screenShareStreamUuid &&
      scene?.streamController?.streamByStreamUuid?.get(screenShareStreamUuid);

    const cameraStreamUuid = Array.from(
      scene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []
    ).find(
      (streamUuid) =>
        scene?.streamController?.streamByStreamUuid.get(streamUuid)
          ?.videoSourceType === AgoraRteVideoSourceType.Camera
    );
    const cameraStream =
      cameraStreamUuid &&
      scene?.streamController?.streamByStreamUuid?.get(cameraStreamUuid);
    const mobileStreamUuid = Array.from(
      scene?.streamController?.streamByUserUuid.get(subDeviceUserUuid) || []
    ).find(
      (streamUuid) =>
        scene?.streamController?.streamByStreamUuid.get(streamUuid)
          ?.videoSourceType === AgoraRteVideoSourceType.Camera
    );
    const mobileStream =
      mobileStreamUuid &&
      scene?.streamController?.streamByStreamUuid?.get(mobileStreamUuid);
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
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={screenShareStream}
            ></RemoteTrackPlayerWithFullScreen>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {cameraStream && (
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={cameraStream}
            ></RemoteTrackPlayerWithFullScreen>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {mobileStream && (
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={mobileStream}
            ></RemoteTrackPlayerWithFullScreen>
          )}
        </div>
      </div>
    );
  }
);
