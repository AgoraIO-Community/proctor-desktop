import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  ClassroomState,
  ClassState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRole2RteRole,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduSessionInfo,
  GroupDetail,
} from "agora-edu-core";
import {
  AgoraRteMediaPublishState,
  AgoraRteScene,
  bound,
  Logger,
  retryAttempt,
} from "agora-rte-sdk";
import to from "await-to-js";
import dayjs from "dayjs";
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";
import { transI18n } from "~ui-kit";
import { EduUIStoreBase } from "../base";
import { SceneSubscription, SubscriptionFactory } from "../subscription/room";
import { RoomScene } from "./struct";

export class RoomUIStore extends EduUIStoreBase {
  private _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();
  private _disposers: (IReactionDisposer | Lambda)[] = [];
  @observable roomScenes: Map<string, RoomScene> = new Map();
  roomSceneByRoomUuid = computedFn((roomUuid: string) => {
    return this.roomScenes.get(roomUuid);
  });
  createSceneSubscription(scene: AgoraRteScene) {
    if (!this._sceneSubscriptions.has(scene.sceneId)) {
      const sub = SubscriptionFactory.createSubscription(scene);

      sub && this._sceneSubscriptions.set(scene.sceneId, sub);
    }
    return this._sceneSubscriptions.get(scene.sceneId);
  }
  @bound
  async joinClassroom(roomUuid: string, roomType?: EduRoomTypeEnum) {
    if (this.roomSceneByRoomUuid(roomUuid)) {
      if (
        this.roomSceneByRoomUuid(roomUuid)?.roomState.state !==
        ClassroomState.Connected
      ) {
        return;
      }
    }

    const roomScene = new RoomScene(this.classroomStore);
    let engine = this.classroomStore.connectionStore.getEngine();

    let [error] = await to(
      retryAttempt(async () => {
        try {
          roomScene.setClassroomState(ClassroomState.Connecting);
          let { sessionInfo } = EduClassroomConfig.shared;
          sessionInfo = {
            ...sessionInfo,
            roomUuid,
            roomType: roomType ? roomType : sessionInfo.roomType,
          };
          await this.checkIn(sessionInfo, roomScene);
          const scene = engine.createAgoraRteScene(roomUuid);
          this.createSceneSubscription(scene);
          roomScene.setScene(scene);
          // streamId defaults to 0 means server allocate streamId for you
          await scene.joinScene({
            userName: sessionInfo.userName,
            userRole: EduRole2RteRole(sessionInfo.roomType, sessionInfo.role),
            streamId: "0",
          });
          runInAction(() => {
            this.roomScenes.set(roomUuid, roomScene);
          });
        } catch (e) {
          console.log(e);
        }
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
    return roomScene;
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

  /**
   * for student only
   */
  get currentGroupUuid() {
    const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
    const userUuidPrefix = userUuid.split("-")[0];
    return `${roomUuid}-${userUuidPrefix}`;
  }

  /**
   * 新增组
   */
  @action.bound
  addGroup() {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    const groupUuid = this.currentGroupUuid;
    const newUsers = { userUuid };
    this.classroomStore.groupStore.addGroups(
      [
        {
          groupUuid: `${groupUuid}`,
          groupName: groupUuid,
          users: [newUsers],
        },
      ],
      false
    );
  }

  private _checkUserRoomState = (groupDetails: Map<string, GroupDetail>) => {
    const currentGroupUuid = this.currentGroupUuid;
    let visibleGroup = false;
    for (let [groupUuid] of groupDetails) {
      if (groupUuid === currentGroupUuid) {
        visibleGroup = true;
        return;
      }
    }
    if (!visibleGroup) {
      Logger.info(`${currentGroupUuid} join in`);
      this.addGroup();
    }
  };
  @bound
  private _addGroupDetailsChange(groupDetails: Map<string, GroupDetail>) {
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student &&
      this._checkUserRoomState(groupDetails);
  }
  @bound
  private async _handleClassroomEvent(type: AgoraEduClassroomEvent, args: any) {
    if (type === AgoraEduClassroomEvent.JoinSubRoom) {
      const currentGroupUuid = this.currentGroupUuid;
      await this.joinClassroom(currentGroupUuid, EduRoomTypeEnum.RoomGroup);
      if (this.roomSceneByRoomUuid(currentGroupUuid)!.scene) {
        await this.roomSceneByRoomUuid(currentGroupUuid)?.scene?.joinRTC();
        this.classroomStore.streamStore.updateLocalPublishState(
          {
            videoState: AgoraRteMediaPublishState.Published,
            audioState: AgoraRteMediaPublishState.Published,
          },
          this.roomSceneByRoomUuid(currentGroupUuid)?.scene
        );
      }
    }
  }
  /**
   * 教室时间信息
   * @returns
   */
  @computed
  get classroomSchedule() {
    return this.classroomStore.roomStore.classroomSchedule;
  }
  /**
   * 教室状态
   * @returns
   */
  @computed
  get classState() {
    return this.classroomSchedule.state;
  }

  /**
   * 服务器时间
   * @returns
   */
  @computed
  get calibratedTime() {
    const { clockTime, clientServerTimeShift } = this.classroomStore.roomStore;
    return clockTime + clientServerTimeShift;
  }

  /**
   * 教室倒计时
   * @returns
   */
  @computed
  get classTimeDuration(): number {
    let duration = -1;
    if (this.classroomSchedule) {
      switch (this.classState) {
        case ClassState.beforeClass:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = 0;
          }
          break;
        case ClassState.ongoing:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = Math.max(
              this.classroomSchedule.duration
                ? this.classroomSchedule.duration -
                    this.calibratedTime +
                    this.classroomSchedule.startTime
                : this.calibratedTime - this.classroomSchedule.startTime,
              0
            );
          }
          break;
        case ClassState.afterClass:
          if (
            this.classroomSchedule.startTime !== undefined &&
            this.classroomSchedule.duration !== undefined
          ) {
            duration = Math.max(
              this.calibratedTime - this.classroomSchedule.startTime,
              0
            );
          }
          break;
      }
    }
    return duration;
  }

  formatCountDown = (time: number) => {
    const classDuration = dayjs.duration({ milliseconds: time });
    return classDuration.format("mm:ss");
  };
  /**
   * 教室状态文字
   * @returns
   */
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
      return `-- : --`;
    }
    switch (this.classState) {
      case ClassState.beforeClass:
        return `-- : --`;
      case ClassState.ongoing:
        return `${transI18n("nav.started_elapse")}${this.formatCountDown(
          duration
        )}`;
      case ClassState.afterClass:
        return `${transI18n("nav.ended_elapse")}${this.formatCountDown(
          duration
        )}`;
      default:
        return `-- : --`;
    }
  }
  /** Hooks */
  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.groupStore.groupDetails).observe(
        ({ newValue, oldValue }) => {
          if (!oldValue?.size) {
            this._addGroupDetailsChange(newValue);
          }
        }
      )
    );

    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvent);
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
