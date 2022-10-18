import { AgoraEduSDK, ConvertMediaOptionsConfig } from '@/infra/api';
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
  LeaveReason,
} from 'agora-edu-core';
import {
  AGError,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteScene,
  AGRtcConnectionType,
  bound,
  Logger,
  retryAttempt,
} from 'agora-rte-sdk';
import { Modal } from 'antd';
import to from 'await-to-js';
import dayjs from 'dayjs';
import md5 from 'js-md5';
import { action, computed, IReactionDisposer, Lambda, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { transI18n } from '~ui-kit';
import { EduUIStoreBase } from '../base';
import { SceneSubscription, SubscriptionFactory } from '../subscription/room';
import { RoomScene } from './struct';

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
  async joinClassroom(
    roomUuid: string,
    roomType?: EduRoomTypeEnum,
    stream?: {
      videoState?: AgoraRteMediaPublishState | undefined;
      audioState?: AgoraRteMediaPublishState | undefined;
      videoSourceState?: AgoraRteMediaSourceState | undefined;
      audioSourceState?: AgoraRteMediaSourceState | undefined;
    },
  ) {
    if (this.roomSceneByRoomUuid(roomUuid)) {
      if (this.roomSceneByRoomUuid(roomUuid)?.roomState.state !== ClassroomState.Connected) {
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
          await this.checkIn(sessionInfo, roomScene, stream);
          const scene = engine.createAgoraRteScene(roomUuid);
          this.createSceneSubscription(scene);
          roomScene.setScene(scene);
          // streamId defaults to 0 means server allocate streamId for you
          await scene.joinScene({
            userName: sessionInfo.userName,
            userRole: EduRole2RteRole(sessionInfo.roomType, sessionInfo.role),
            streamId: '0',
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
        .exec(),
    );

    if (error) {
      roomScene.setClassroomState(ClassroomState.Idle);
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_CLASSROOM_FAIL,
        error,
      );
    }

    roomScene.setClassroomState(ClassroomState.Connected);
    return roomScene;
  }
  async checkIn(
    sessionInfo: EduSessionInfo,
    roomScene: RoomScene,
    stream?: {
      videoState?: AgoraRteMediaPublishState | undefined;
      audioState?: AgoraRteMediaPublishState | undefined;
      videoSourceState?: AgoraRteMediaSourceState | undefined;
      audioSourceState?: AgoraRteMediaSourceState | undefined;
    },
  ) {
    const { data, ts } = await this.classroomStore.api.checkIn(sessionInfo, undefined, stream);
    const { state = 0, startTime, duration, closeDelay = 0, rtcRegion, rtmRegion, vid } = data;
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
    const userUuidPrefix = userUuid.split('-')[0];
    return md5(`${roomUuid}-${userUuidPrefix}`);
  }

  /**
   * 新增组
   */
  @action.bound
  addGroup() {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    const newUsers = { userUuid };
    const userUuidPrefix = userUuid.split('-')[0];

    this.classroomStore.groupStore.addGroups(
      [
        {
          groupUuid: this.currentGroupUuid,
          groupName: userUuidPrefix,
          users: [newUsers],
        },
      ],
      false,
    );
  }

  private _checkUserRoomState = () => {
    const group = this.classroomStore.groupStore.groupDetails.get(this.currentGroupUuid);

    if (!group) {
      Logger.info(`${this.currentGroupUuid} join in`);
      this.addGroup();
    } else {
      const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
      if (!group.users.find((user) => user.userUuid === userUuid)) {
        this.classroomStore.groupStore.updateGroupUsers(
          [
            {
              groupUuid: this.currentGroupUuid,
              addUsers: [userUuid],
            },
          ],
          false,
        );
      }
    }
  };
  @bound
  private _addGroupDetailsChange() {
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student &&
      this._checkUserRoomState();
  }
  @bound
  private async _handleClassroomEvent(type: AgoraEduClassroomEvent, args: any) {
    if (type === AgoraEduClassroomEvent.JoinSubRoom) {
      const roomScene = await this.joinClassroom(this.currentGroupUuid, EduRoomTypeEnum.RoomGroup);
      try {
        const launchLowStreamCameraEncoderConfigurations = (
          EduClassroomConfig.shared.rteEngineConfig.rtcConfigs as ConvertMediaOptionsConfig
        )?.defaultLowStreamCameraEncoderConfigurations;

        await this.classroomStore.mediaStore.enableDualStream(
          true,
          AGRtcConnectionType.main,
          roomScene?.scene,
        );

        await this.classroomStore.mediaStore.setLowStreamParameter(
          launchLowStreamCameraEncoderConfigurations ||
            EduClassroomConfig.defaultLowStreamParameter(),
          AGRtcConnectionType.main,
          roomScene?.scene,
        );
      } catch (e) {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      }
      if (roomScene) {
        await roomScene.scene?.joinRTC();
        this.classroomStore.streamStore.updateLocalPublishState(
          {
            videoState: AgoraRteMediaPublishState.Published,
            audioState: AgoraRteMediaPublishState.Published,
          },
          roomScene.scene,
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
                ? this.classroomSchedule.duration * 1000 -
                    this.calibratedTime +
                    this.classroomSchedule.startTime
                : this.calibratedTime - this.classroomSchedule.startTime,
              0,
            );
          }
          break;
        case ClassState.afterClass:
          if (
            this.classroomSchedule.startTime !== undefined &&
            this.classroomSchedule.duration !== undefined
          ) {
            duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0);
          }
          break;
      }
    }
    return duration;
  }

  formatCountDown = (time: number) => {
    const classDuration = dayjs.duration(time, 'ms');
    return classDuration.format('mm:ss');
  };

  @computed
  get formatStartTime() {
    return dayjs(this.classroomSchedule.startTime).format('HH:mm');
  }
  /**
   * 教室状态文字
   * @returns
   */
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      return `-- : --`;
    }
    switch (this.classState) {
      case ClassState.beforeClass:
        return this.formatStartTime;
      case ClassState.ongoing:
        return `${this.formatCountDown(duration)}`;
      case ClassState.afterClass:
        return `00 : 00`;
      default:
        return `-- : --`;
    }
  }

  @computed
  get statusTextTip() {
    if (this.classState === ClassState.beforeClass) {
      return transI18n('fcr_room_label_start_time');
    } else {
      return transI18n('fcr_room_label_time_remaining');
    }
  }
  /** Hooks */
  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.groupStore.groupDetails).observe(
        ({ newValue, oldValue }) => {
          if (!oldValue?.size) {
            this._addGroupDetailsChange();
          }
        },
      ),
    );
    if (
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student &&
      AgoraEduSDK.checkStudentScreenShareState
    ) {
      this._disposers.push(
        computed(() => ({
          screenShareState: this.classroomStore.mediaStore.localScreenShareTrackState,
          classRoomState: this.roomSceneByRoomUuid(this.currentGroupUuid)?.roomState.state,
        })).observe(({ newValue, oldValue }) => {
          if (newValue.classRoomState === ClassroomState.Connected) {
            const { role } = EduClassroomConfig.shared.sessionInfo;
            if (
              (newValue.screenShareState === AgoraRteMediaSourceState.stopped ||
                newValue.screenShareState === AgoraRteMediaSourceState.error) &&
              role === EduRoleTypeEnum.student
            ) {
              this.classroomStore.connectionStore.leaveClassroomUntil(
                LeaveReason.leave,
                new Promise((resolve) => {
                  this.shareUIStore.addConfirmDialog(
                    transI18n('fcr_alert_title'),
                    transI18n('fcr_exam_prep_label_close_screen_share'),
                    {
                      onOK: resolve,
                      btnText: { ok: transI18n('fcr_room_button_leave'), cancel: '' },
                      actions: ['ok'],
                    },
                  );
                }),
              );
            }
          }
        }),
      );
    }

    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvent);
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
