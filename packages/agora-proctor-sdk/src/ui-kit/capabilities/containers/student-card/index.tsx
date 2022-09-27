import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import { RemoteTrackPlayerWithFullScreen } from "../stream/track-player";
import { observer } from "mobx-react";
import { EduClassroomConfig, EduRoomTypeEnum } from "agora-edu-core";
import { AgoraRteVideoSourceType } from "agora-rte-sdk";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { DeviceTypeEnum } from "@/infra/api";
export const StudentCard = observer(
  ({
    userUuidPrefix,
    renderVideos,
  }: {
    userUuidPrefix: string;
    renderVideos: boolean;
  }) => {
    const {
      layoutUIStore: { addStudentTab },
      usersUIStore: {
        videosWallLayout,
        updateUserTags,

        generateDeviceUuid,
      },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();

    const mainDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main),
      []
    );

    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

    const focus: React.MouseEventHandler = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await updateUserTags(
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
          addStudentTab(
            userUuidPrefix,
            mainDeviceStudent?.userName || "student"
          )
        }
      >
        {renderVideos && (
          <StudentVideos
            userUuidPrefix={userUuidPrefix}
            layout={videosWallLayout}
          />
        )}

        <div className="fcr-student-card-extra">
          <div className="fcr-student-card-user">
            <div className="fcr-student-card-user-avatar">
              <img
                src={
                  mainDeviceStudent?.userProperties?.get("flexProps")?.avatar
                }
              />
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
    userUuidPrefix,
  }: {
    layout: VideosWallLayoutEnum;
    userUuidPrefix: string;
  }) => {
    const {
      roomUIStore: { joinClassroom, roomSceneByRoomUuid, leaveClassroom },
      usersUIStore: { generateDeviceUuid, generateGroupUuid },
    } = useStore();
    const mainDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main),
      []
    );
    const subDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub),
      []
    );
    const roomUuid = useMemo(() => generateGroupUuid(userUuidPrefix), []);

    const [joinSuccess, setJoinSuccess] = useState(false);
    const scene = roomSceneByRoomUuid(roomUuid);

    const join = async () => {
      const roomScene = await joinClassroom(
        roomUuid,
        EduRoomTypeEnum.RoomGroup,
        {
          audioState: 0,
          videoState: 0,
        }
      );
      if (roomScene?.scene) {
        await roomScene.scene.joinRTC();
        setJoinSuccess(true);
      }
    };
    useEffect(() => {
      join();
      return () => {
        leaveClassroom(roomUuid);
      };
    }, []);

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

    const mainDeviceCameraStreamUuid = Array.from(
      scene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []
    ).find(
      (streamUuid) =>
        scene?.streamController?.streamByStreamUuid.get(streamUuid)
          ?.videoSourceType === AgoraRteVideoSourceType.Camera
    );
    const mainDeviceCameraStream =
      mainDeviceCameraStreamUuid &&
      scene?.streamController?.streamByStreamUuid?.get(
        mainDeviceCameraStreamUuid
      );
    const subDeviceStreamUuid = Array.from(
      scene?.streamController?.streamByUserUuid.get(subDeviceUserUuid) || []
    ).find(
      (streamUuid) =>
        scene?.streamController?.streamByStreamUuid.get(streamUuid)
          ?.videoSourceType === AgoraRteVideoSourceType.Camera
    );
    const subDeviceStream =
      subDeviceStreamUuid &&
      scene?.streamController?.streamByStreamUuid?.get(subDeviceStreamUuid);
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? "fcr-student-card-videos-compact"
            : "fcr-student-card-videos-loose"
        }`}
      >
        <div className="fcr-student-card-videos-screen">
          {screenShareStream ? (
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={screenShareStream}
            ></RemoteTrackPlayerWithFullScreen>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {mainDeviceCameraStream ? (
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={mainDeviceCameraStream}
            ></RemoteTrackPlayerWithFullScreen>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {subDeviceStream ? (
            <RemoteTrackPlayerWithFullScreen
              fromScene={scene?.scene}
              stream={subDeviceStream}
            ></RemoteTrackPlayerWithFullScreen>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
      </div>
    );
  }
);
