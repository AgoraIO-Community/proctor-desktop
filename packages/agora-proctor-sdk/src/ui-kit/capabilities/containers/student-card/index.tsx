import "./index.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import {
  RemoteTrackPlayer,
  RemoteTrackPlayerWithFullScreen,
} from "../stream/track-player";
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
        {!!mainDeviceStudent?.userProperties?.get("tags")?.abnormal && (
          <div className="fcr-student-card-abnormal">
            <SvgImg type={SvgIconEnum.ABNORMAL}></SvgImg>
          </div>
        )}
        {renderVideos && (
          <StudentVideos
            userUuidPrefix={userUuidPrefix}
            layout={videosWallLayout}
          />
        )}

        <div className="fcr-student-card-extra">
          <div className="fcr-student-card-user">
            <UserAvatar userUuidPrefix={userUuidPrefix} />
            <div className="fcr-student-card-user-name">
              {mainDeviceStudent?.userName}
            </div>
          </div>
          <div className="fcr-student-card-actions">
            <UserFocus userUuidPrefix={userUuidPrefix} />
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
    showFullscreen = false,
  }: {
    layout: VideosWallLayoutEnum;
    userUuidPrefix: string;
    showFullscreen?: boolean;
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
    const roomUuid = generateGroupUuid(userUuidPrefix)!;
    const [joinSuccess, setJoinSuccess] = useState(false);
    const scene = roomSceneByRoomUuid(roomUuid);

    const join = async () => {
      const roomScene = await joinClassroom(
        roomUuid,
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
    const Player = useMemo(
      () =>
        showFullscreen ? RemoteTrackPlayerWithFullScreen : RemoteTrackPlayer,
      [showFullscreen]
    );
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
            <Player
              fromScene={scene?.scene}
              stream={screenShareStream}
            ></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {mainDeviceCameraStream ? (
            <Player
              fromScene={scene?.scene}
              stream={mainDeviceCameraStream}
            ></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {subDeviceStream ? (
            <Player fromScene={scene?.scene} stream={subDeviceStream}></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO}></SvgImg>
          )}
        </div>
      </div>
    );
  }
);

export const StudentHLSVideos = observer(
  ({
    layout,
    mainDeviceScreenVideo,
    mainDeviceCameraVideo,
    subDeviceCameraVideo,
  }: {
    layout: VideosWallLayoutEnum;
    mainDeviceScreenVideo?: string;
    mainDeviceCameraVideo?: string;
    subDeviceCameraVideo?: string;
  }) => {
    const screenContainerRef = useRef(null);
    const mainCameraContainerRef = useRef(null);
    const subCameraContainerRef = useRef(null);
    const {
      classroomStore: {
        mediaStore: { setupMediaStream },
      },
    } = useStore();
    useEffect(() => {
      mainDeviceScreenVideo &&
        setupMediaStream(
          mainDeviceScreenVideo,
          screenContainerRef.current!,
          false,
          true,
          true
        );
    }, [mainDeviceScreenVideo]);
    useEffect(() => {
      mainDeviceCameraVideo &&
        setupMediaStream(
          mainDeviceCameraVideo,
          mainCameraContainerRef.current!,
          false,
          true,
          true
        );
    }, [mainDeviceCameraVideo]);
    useEffect(() => {
      subDeviceCameraVideo &&
        setupMediaStream(
          subDeviceCameraVideo,
          subCameraContainerRef.current!,
          false,
          true,
          true
        );
    }, [subDeviceCameraVideo]);
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? "fcr-student-card-videos-compact"
            : "fcr-student-card-videos-loose"
        }`}
      >
        <div
          ref={screenContainerRef}
          className="fcr-student-card-videos-screen"
        ></div>
        <div
          ref={mainCameraContainerRef}
          className="fcr-student-card-videos-camera"
        ></div>
        <div
          ref={subCameraContainerRef}
          className="fcr-student-card-videos-mobile"
        ></div>
      </div>
    );
  }
);
export const UserAbnormal = observer(
  ({
    userUuidPrefix,
    size = 30,
  }: {
    userUuidPrefix: string;
    size?: number;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(
      userUuidPrefix,
      DeviceTypeEnum.Main
    );
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);
    return mainDeviceStudent?.userProperties?.get("tags")?.abnormal ? (
      <SvgImg type={SvgIconEnum.ABNORMAL} size={size}></SvgImg>
    ) : null;
  }
);
export const UserAvatar = observer(
  ({
    userUuidPrefix,
    size = 30,
    children,
  }: {
    userUuidPrefix: string;
    size?: number;
    children?: JSX.Element;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(
      userUuidPrefix,
      DeviceTypeEnum.Main
    );
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

    return (
      <div style={{ position: "relative" }}>
        {children}
        <div
          style={{ width: size, height: size }}
          className="fcr-student-card-user-avatar"
        >
          <img
            src={mainDeviceStudent?.userProperties?.get("flexProps")?.avatar}
          />
        </div>
      </div>
    );
  }
);

export const UserFocus = observer(
  ({
    userUuidPrefix,
    size = 32,
    iconSize = 24,
  }: {
    userUuidPrefix: string;
    size?: number;
    iconSize?: number;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid, updateUserTags },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(
      userUuidPrefix,
      DeviceTypeEnum.Main
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
        className="fcr-student-card-actions-like"
        style={{ width: size, height: size }}
        onClick={focus}
      >
        <SvgImg
          size={iconSize}
          type={SvgIconEnum.FAV}
          colors={{
            iconPrimary:
              mainDeviceStudent?.userProperties?.get("tags")?.focus === 1
                ? "#FF5474"
                : "#63626F",
          }}
        ></SvgImg>
      </div>
    );
  }
);
