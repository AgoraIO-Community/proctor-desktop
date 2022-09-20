import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  ClassroomState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRole2RteRole,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduSessionInfo,
  GroupDetail,
} from "agora-edu-core";
import { AgoraRteMediaPublishState, bound, retryAttempt } from "agora-rte-sdk";
import to from "await-to-js";
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";
import { EduUIStoreBase } from "../base";
import { RoomScene } from "./struct";

export class RoomUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];
  @observable roomScenes: Map<string, RoomScene> = new Map();
  roomSceneByRoomUuid = computedFn((roomUuid: string) => {
    return this.roomScenes.get(roomUuid);
  });
  @bound
  async joinClassroom(roomUuid: string, roomType?: EduRoomTypeEnum) {
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

  generateGroupUuid = () => {
    const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
    const tagIndex = userUuid.indexOf("-main");
    const groupUuid = userUuid.slice(0, tagIndex);
    return groupUuid;
  };

  /**
   * 新增组
   */
  @action.bound
  addGroup() {
    const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
    const groupUuid = this.generateGroupUuid();
    const newGroup = { groupUuid, groupName: groupUuid };
    const newUsers = { userUuid };
    this.classroomStore.groupStore.addGroups(
      [
        {
          groupUuid: newGroup.groupUuid,
          groupName: newGroup.groupName,
          users: [newUsers],
        },
      ],
      false
    );
  }

  private _checkUserRoomState = (groupDetails: Map<string, GroupDetail>) => {
    const currentGroupUuid = this.generateGroupUuid();
    let visibleGroup = false;
    for (let [groupUuid] of groupDetails) {
      if (groupUuid === currentGroupUuid) {
        visibleGroup = true;
        return;
      }
    }
    if (!visibleGroup) {
      console.log("add group");
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
      const currentGroupUuid = this.generateGroupUuid();
      await this.joinClassroom(currentGroupUuid, EduRoomTypeEnum.RoomGroup);
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
