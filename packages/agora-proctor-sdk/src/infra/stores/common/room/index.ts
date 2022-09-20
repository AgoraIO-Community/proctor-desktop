import {
  AGEduErrorCode,
  ClassroomState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRole2RteRole,
  EduRoomSubtypeEnum,
} from "agora-edu-core";
import { EduSessionInfo } from "agora-edu-core/src/type";
import {
  AgoraRteConnectionState,
  AgoraRteEventType,
  AgoraRteSceneJoinRTCOptions,
  bound,
  retryAttempt,
} from "agora-rte-sdk";
import to from "await-to-js";
import { observable } from "mobx";
import { computedFn } from "mobx-utils";
import { EduUIStoreBase } from "../base";
import { RoomScene } from "./struct";

export class RoomUIStore extends EduUIStoreBase {
  @observable roomScenes: Map<string, RoomScene> = new Map();
  roomSceneByRoomUuid = computedFn((roomUuid: string) => {
    return this.roomScenes.get(roomUuid);
  });
  @bound
  async joinClassroom(roomUuid: string) {
    const roomScene = new RoomScene(this.classroomStore);
    let engine = this.classroomStore.connectionStore.getEngine();

    let [error] = await to(
      retryAttempt(async () => {
        roomScene.setClassroomState(ClassroomState.Connecting);
        const { sessionInfo } = EduClassroomConfig.shared;
        await this.checkIn(sessionInfo, roomScene);

        await engine.login(sessionInfo.token, sessionInfo.userUuid);
        const scene = engine.createAgoraRteScene(roomUuid);

        roomScene.setScene(scene);
        // streamId defaults to 0 means server allocate streamId for you
        await scene.joinScene({
          userName: sessionInfo.userName,
          userRole: EduRole2RteRole(sessionInfo.roomType, sessionInfo.role),
          streamId: "0",
        });
        this.roomScenes.set(roomUuid, roomScene);
      }, [])
        .fail(({ error }: { error: Error }) => {
          this.logger.error(error.message);
          return true;
        })
        .abort(() => {})
        .exec()
    );

    if (error) {
      roomScene.setClassroomState(ClassroomState.Idle);
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_CLASSROOM_FAIL,
        error
      );
    }

    roomScene.setClassroomState(ClassroomState.Connected);
  }
  async checkIn(sessionInfo: EduSessionInfo, roomScene: RoomScene) {
    const { data, ts } = await this.classroomStore.api.checkIn(sessionInfo);
    const {
      state = 0,
      startTime,
      duration,
      closeDelay = 0,
      rtcRegion,
      rtmRegion,
      vid,
    } = data;
    EduClassroomConfig.shared.rteEngineConfig.setRtcRegion(rtcRegion);
    EduClassroomConfig.shared.rteEngineConfig.setRtmRegion(rtmRegion);
    roomScene.setCheckInData({
      vid,
      clientServerTime: ts,
      classRoomSchedule: {
        state,
        startTime,
        duration,
        closeDelay,
      },
      rtcRegion,
      rtmRegion,
    });
  }
  @bound
  async leaveClassroom(roomUuid: string) {
    await this.roomSceneByRoomUuid(roomUuid)?.leave();
    this.roomScenes.delete(roomUuid);
  }
  onDestroy() {}
  onInstall() {}
}
