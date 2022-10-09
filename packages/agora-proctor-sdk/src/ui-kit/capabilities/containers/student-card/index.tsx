import "./index.css";
import { useEffect, useMemo, useState, useRef } from "react";

import {
  UserEvents as userEventsType,
  VideosWallLayoutEnum,
  UserAbnormal as UserAbnormalType,
} from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import { Slider } from "antd";
import {
  RemoteTrackPlayer,
  RemoteTrackPlayerWithFullScreen,
} from "../stream/track-player";
import { observer } from "mobx-react";
import { EduClassroomConfig, EduRoomTypeEnum } from "agora-edu-core";
import {
  AgoraRteVideoSourceType,
  MediaPlayerEvents,
  StreamMediaPlayer,
} from "agora-rte-sdk";
import dayjs from "dayjs";
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
            <UserEvents userUuidPrefix={userUuidPrefix}></UserEvents>
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
    const screenContainerRef = useRef<HTMLDivElement>(null);
    const mainCameraContainerRef = useRef<HTMLDivElement>(null);
    const subCameraContainerRef = useRef<HTMLDivElement>(null);
    const playerControlRef = useRef<{
      screen?: StreamMediaPlayer;
      mainCamera?: StreamMediaPlayer;
      subCamera?: StreamMediaPlayer;
    }>({});
    const [totalDuration, setTotalDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    useEffect(() => {
      if (mainDeviceScreenVideo && !playerControlRef.current.screen) {
        playerControlRef.current.screen = new StreamMediaPlayer(
          mainDeviceScreenVideo
        );
        playerControlRef.current.screen.on(
          MediaPlayerEvents.LevelLoaded,
          (totalDuration: number) => {
            setTotalDuration(totalDuration);
          }
        );
        playerControlRef.current.screen.setView(
          screenContainerRef.current as HTMLDivElement
        );

        playerControlRef.current.screen.play(true, true);
        playerControlRef.current.screen.mediaElement?.addEventListener(
          "timeupdate",
          (e) => {
            playerControlRef.current.screen?.mediaElement &&
              setCurrentTime(
                playerControlRef.current.screen.mediaElement.currentTime
              );
          }
        );
      }
    }, [mainDeviceScreenVideo]);
    useEffect(() => {
      if (mainDeviceCameraVideo) {
        playerControlRef.current.mainCamera = new StreamMediaPlayer(
          mainDeviceCameraVideo
        );
        playerControlRef.current.mainCamera.setView(
          mainCameraContainerRef.current as HTMLDivElement
        );
        playerControlRef.current.mainCamera.play(true, true);
      }
    }, [mainDeviceCameraVideo]);
    useEffect(() => {
      if (subDeviceCameraVideo) {
        playerControlRef.current.subCamera = new StreamMediaPlayer(
          subDeviceCameraVideo
        );
        playerControlRef.current.subCamera.setView(
          mainCameraContainerRef.current as HTMLDivElement
        );
        playerControlRef.current.subCamera.play(true, true);
      }
    }, [subDeviceCameraVideo]);
    const onSliderChange = (val: number) => {
      if (playerControlRef.current.screen?.mediaElement) {
        playerControlRef.current.screen.mediaElement.currentTime = val;
        setCurrentTime(val);
      }
      if (playerControlRef.current.mainCamera?.mediaElement) {
        playerControlRef.current.mainCamera.mediaElement.currentTime = val;
      }
      if (playerControlRef.current.subCamera?.mediaElement) {
        playerControlRef.current.subCamera.mediaElement.currentTime = val;
      }
    };
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? "fcr-student-card-videos-compact"
            : "fcr-student-card-videos-loose"
        }`}
      >
        <div className="fcr-student-card-videos-progress">
          <Slider
            tooltip={{
              formatter: (val) => {
                return dayjs.duration(val || 0, "s").format("mm:ss");
              },
            }}
            onChange={onSliderChange}
            value={currentTime}
            min={0}
            max={totalDuration}
            marks={{
              0: dayjs.duration(currentTime, "s").format("mm:ss"),
              [totalDuration]: dayjs
                .duration(totalDuration, "s")
                .format("mm:ss"),
            }}
          ></Slider>
        </div>
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
export const UserEvents = observer(
  ({
    userUuidPrefix,
    size = 30,
  }: {
    userUuidPrefix: string;
    size?: number;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid, queryUserEvents },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const [userEvents, setUserEvents] = useState<
      userEventsType<{
        abnormal: UserAbnormalType;
      }>[]
    >([]);
    const queryUserAbnormal = async () => {
      const res = await queryUserEvents(
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid
      );
      setUserEvents(res.list);
    };
    useEffect(() => {
      queryUserAbnormal();
    }, []);
    const mainDeviceUserUuid = generateDeviceUuid(
      userUuidPrefix,
      DeviceTypeEnum.Main
    );
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);
    return (
      <div className="fcr-student-card-actions-warning">
        {userEvents.length > 0 && (
          <div className="fcr-student-card-actions-warning-count">
            {userEvents.length}
          </div>
        )}
        <SvgImg
          type={
            mainDeviceStudent?.userProperties?.get("tags")?.abnormal
              ? SvgIconEnum.MESSAGE_ACTIVE
              : SvgIconEnum.MESSAGE_NORMAL
          }
        ></SvgImg>
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
