import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  AGServiceErrorCode,
  CheckInData,
  ClassroomState,
  EduClassroomConfig,
  EduClassroomStore,
  EduErrorCenter,
  EduEventCenter,
  EduRoleTypeEnum,
  EduStream,
  RteRole2EduRole,
} from "agora-edu-core";
import {
  AGError,
  AgoraRteConnectionState,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraRteSceneJoinRTCOptions,
  AgoraRteThread,
  AgoraStream,
  AGRtcConnectionType,
  bound,
  Injectable,
  Log,
  Logger,
  RtcState,
} from "agora-rte-sdk";
import to from "await-to-js";
import { string } from "joi";
import { get } from "lodash";
import { action, computed, observable, reaction, runInAction } from "mobx";

export class RoomScene {
  protected logger!: Injectable.Logger;
  @observable streamController: StreamController | null = null;

  @observable checkInData?: CheckInData;
  @observable roomState: {
    state: ClassroomState;
    roomStateErrorReason: string;
  } = {
    state: ClassroomState.Idle,
    roomStateErrorReason: "",
  };
  @observable scene?: AgoraRteScene;
  @observable rtcState?: Map<AGRtcConnectionType, RtcState> = new Map()
    .set(AGRtcConnectionType.main, RtcState.Idle)
    .set(AGRtcConnectionType.sub, RtcState.Idle);
  constructor(private classroomStore: EduClassroomStore) {}

  @action.bound
  setClassroomState(state: ClassroomState, reason?: string) {
    if (this.roomState.state !== state) {
      // this.logger.info(`classroom state changed to ${state} ${reason}`);
      Logger.info(`classroom state changed to ${state} ${reason}`);
      if (state === ClassroomState.Error && reason) {
        this.roomState.roomStateErrorReason = reason;
      }
      this.roomState.state = state;
    }
  }
  @action.bound
  setCheckInData(checkInData: CheckInData) {
    this.checkInData = checkInData;
  }
  @action.bound
  setScene(scene: AgoraRteScene) {
    this.scene = scene;
    this.streamController = new StreamController(
      scene,
      this.classroomStore,
      this
    );
    //listen to rte state change
    scene.on(
      AgoraRteEventType.RteConnectionStateChanged,
      (state: AgoraRteConnectionState, reason?: string) => {
        this.setClassroomState(this._getClassroomState(state), reason);
      }
    );

    //listen to rtc state change
    scene.on(
      AgoraRteEventType.RtcConnectionStateChanged,
      (state, connectionType) => {
        this.setRtcState(state, connectionType);
      }
    );
  }
  @action.bound
  setRtcState(state: RtcState, connectionType?: AGRtcConnectionType) {
    let connType = connectionType ? connectionType : AGRtcConnectionType.main;
    if (
      connType === AGRtcConnectionType.main &&
      this.rtcState?.get(AGRtcConnectionType.main) !== state
    ) {
      EduEventCenter.shared.emitClasroomEvents(
        AgoraEduClassroomEvent.RTCStateChanged,
        state,
        this.scene?.sceneId
      );
    }
    // this.logger.debug(`${connectionType}] rtc state changed to ${state}`);
    this.rtcState?.set(connType, state);
  }
  private _getClassroomState(state: AgoraRteConnectionState): ClassroomState {
    switch (state) {
      case AgoraRteConnectionState.Idle:
        return ClassroomState.Idle;
      case AgoraRteConnectionState.Connecting:
        return ClassroomState.Connecting;
      case AgoraRteConnectionState.Connected:
        return ClassroomState.Connected;
      case AgoraRteConnectionState.Reconnecting:
        return ClassroomState.Reconnecting;
      case AgoraRteConnectionState.Error:
        return ClassroomState.Error;
    }
  }
  async leave() {
    if (this.rtcState?.get(AGRtcConnectionType.sub) !== RtcState.Idle) {
      this.classroomStore.mediaStore.stopScreenShareCapture();
      await this.scene?.leaveRTC(AGRtcConnectionType.sub);
    }
    let [err] = await to(this?.scene?.leaveRTC() || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_LEAVE_RTC_FAIL,
        err
      );
    [err] = await to(this?.scene?.leaveScene() || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleNonThrowableError(
        AGEduErrorCode.EDU_ERR_LEAVE_CLASSROOM_FAIL,
        err
      );
  }
}

class StreamController {
  @observable dataStore: {
    stateKeeper?: ShareStreamStateKeeper;
    streamByStreamUuid: Map<string, EduStream>;
    streamByUserUuid: Map<string, Set<string>>;
    userStreamRegistry: Map<string, boolean>;
    streamVolumes: Map<string, number>;
    shareStreamTokens: Map<string, string>;
    screenShareStreamUuid: string;
  } = {
    stateKeeper: undefined,
    streamByStreamUuid: new Map(),
    streamByUserUuid: new Map(),
    userStreamRegistry: new Map(),
    streamVolumes: new Map(),
    shareStreamTokens: new Map(),
    screenShareStreamUuid: "",
  };
  @computed
  get screenShareStateAccessor() {
    return {
      trackState: this._classroomStore.mediaStore.localScreenShareTrackState,
      classroomState: this._roomScene.roomState.state,
    };
  }

  @computed
  get screenShareTokenAccessor() {
    return {
      streamUuid: this.dataStore.screenShareStreamUuid,
      shareStreamToken: this.shareStreamToken,
    };
  }
  @computed get shareStreamToken() {
    let streamUuid = this.dataStore.screenShareStreamUuid;

    if (!streamUuid) {
      return undefined;
    }

    return this.dataStore.shareStreamTokens.get(streamUuid);
  }
  @computed get streamByStreamUuid() {
    return this.dataStore.streamByStreamUuid;
  }
  @computed get streamByUserUuid() {
    return this.dataStore.streamByUserUuid;
  }
  async joinRTC(options?: AgoraRteSceneJoinRTCOptions) {
    //join rtc
    let [err] = await to(this._scene?.joinRTC(options) || Promise.resolve());
    err &&
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_RTC_FAIL,
        err
      );
  }
  constructor(
    private _scene: AgoraRteScene,
    private _classroomStore: EduClassroomStore,
    private _roomScene: RoomScene
  ) {
    this._scene.on(AgoraRteEventType.AudioVolumes, this._updateStreamVolumes);
    this._scene.on(AgoraRteEventType.LocalStreamAdded, this._addLocalStream);
    this._scene.on(
      AgoraRteEventType.LocalStreamRemove,
      this._removeLocalStream
    );
    this._scene.on(
      AgoraRteEventType.LocalStreamUpdate,
      this._updateLocalStream
    );
    this._scene.on(AgoraRteEventType.RemoteStreamAdded, this._addRemoteStream);
    this._scene.on(
      AgoraRteEventType.RemoteStreamRemove,
      this._removeRemoteStream
    );
    this._scene.on(
      AgoraRteEventType.RemoteStreamUpdate,
      this._updateRemoteStream
    );
    this._scene.on(
      AgoraRteEventType.RoomPropertyUpdated,
      this._handleRoomPropertiesChange
    );

    reaction(
      () => this.screenShareStateAccessor,
      (value) => {
        const { trackState, classroomState } = value;
        if (classroomState === ClassroomState.Connected) {
          //only set state when classroom is connected, the state will also be refreshed when classroom state become connected
          this.dataStore.stateKeeper?.setShareScreenState(trackState);
        }
      }
    );
    reaction(
      () => this.screenShareTokenAccessor,
      (value) => {
        const { streamUuid, shareStreamToken } = value;

        if (streamUuid && shareStreamToken) {
          if (
            this._roomScene.rtcState?.get(AGRtcConnectionType.sub) ===
            RtcState.Idle
          ) {
            this._scene.joinRTC({
              connectionType: AGRtcConnectionType.sub,
              streamUuid,
              token: shareStreamToken,
            });
          }
        } else {
          // leave rtc if share StreamUuid is no longer in the room
          if (
            this._roomScene.rtcState?.get(AGRtcConnectionType.sub) !==
            RtcState.Idle
          ) {
            this._scene.leaveRTC(AGRtcConnectionType.sub);
          }
        }
      }
    );
    this.dataStore.stateKeeper = new ShareStreamStateKeeper(
      async (targetState: AgoraRteMediaSourceState) => {
        if (targetState === AgoraRteMediaSourceState.started) {
          const {
            rtcToken,
            streamUuid,
          }: { rtcToken: string; streamUuid: string } =
            await this.publishScreenShare();
          runInAction(() => {
            this.dataStore.shareStreamTokens.set(streamUuid, rtcToken);
          });
        } else if (
          targetState === AgoraRteMediaSourceState.stopped ||
          targetState === AgoraRteMediaSourceState.error
        ) {
          await this.unpublishScreenShare();
          runInAction(() => {
            this.dataStore.shareStreamTokens.clear();
          });
        }
      }
    );
  }
  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === "screen") {
        const screenData = get(roomProperties, "screen");
        if (screenData.state === 1) {
          this.dataStore.screenShareStreamUuid = screenData.streamUuid;
        }
      }
    });
  }

  @bound
  async publishScreenShare() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    try {
      let res = await this._classroomStore.api.startShareScreen(
        this._scene.sceneId,
        sessionInfo.userUuid
      );
      return res;
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_MEDIA_START_SCREENSHARE_FAIL,
        e as Error
      );
    }
  }
  @bound
  async unpublishScreenShare() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    try {
      let res = await this._classroomStore.api.stopShareScreen(
        this._scene.sceneId,
        sessionInfo.userUuid
      );
      return res;
    } catch (e) {
      if (
        !AGError.isOf(e as AGError, AGServiceErrorCode.SERV_SCREEN_NOT_SHARED)
      ) {
        EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_MEDIA_STOP_SCREENSHARE_FAIL,
          e as Error
        );
      }
    }
  }
  private _addStream2UserSet(stream: EduStream, userUuid: string) {
    let streamUuidSet = this.dataStore.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      streamUuidSet = new Set();
    }

    streamUuidSet.add(stream.streamUuid);
    this.dataStore.streamByUserUuid.set(userUuid, streamUuidSet);
  }

  private _removeStreamFromUserSet(streamUuid: string, userUuid: string) {
    let streamUuidSet = this.dataStore.streamByUserUuid.get(userUuid);
    if (!streamUuidSet) {
      return;
    }

    streamUuidSet.delete(streamUuid);
    if (streamUuidSet.size === 0) {
      // delete entry if no more stream
      this.dataStore.streamByUserUuid.delete(userUuid);
    }
  }

  @action.bound
  private _updateStreamVolumes(volumes: Map<string, number>) {
    this.dataStore.streamVolumes = volumes;
  }

  @action.bound
  private _addLocalStream(streams: AgoraStream[]) {
    console.info("Scene Id:", this._scene.sceneId, "Add localStreams", streams);
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeLocalStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.dataStore.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(
        stream.streamUuid,
        stream.fromUser.userUuid
      );
      this.dataStore.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateLocalStream(
    streams: AgoraStream[],
    operator?: AgoraRteOperator
  ) {
    console.info(
      "Scene Id:",
      this._scene.sceneId,
      "Update localStreams",
      streams
    );
    streams.forEach((stream) => {
      if (operator) {
        const { sessionInfo } = EduClassroomConfig.shared;
        let { role, userUuid } = operator;
        const eduRole = RteRole2EduRole(sessionInfo.roomType, role);

        // do not process if it's myself
        if (
          userUuid !== sessionInfo.userUuid &&
          eduRole === EduRoleTypeEnum.teacher
        ) {
          let oldStream = this.dataStore.streamByStreamUuid.get(
            stream.streamUuid
          );
          if (!oldStream) {
            Logger.warn(
              `stream ${stream.streamUuid} not found when updating local stream`
            );
          } else {
            if (oldStream.audioState !== stream.audioState) {
              EduEventCenter.shared.emitClasroomEvents(
                stream.audioState === AgoraRteMediaPublishState.Published
                  ? AgoraEduClassroomEvent.TeacherTurnOnMyMic
                  : AgoraEduClassroomEvent.TeacherTurnOffMyMic
              );
            }
            if (oldStream.videoState !== stream.videoState) {
              EduEventCenter.shared.emitClasroomEvents(
                stream.videoState === AgoraRteMediaPublishState.Published
                  ? AgoraEduClassroomEvent.TeacherTurnOnMyCam
                  : AgoraEduClassroomEvent.TeacherTurnOffMyCam
              );
            }
          }
        }
      }

      const eduStream = new EduStream(stream);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _addRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
  @action.bound
  private _removeRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      this.dataStore.streamByStreamUuid.delete(stream.streamUuid);
      this._removeStreamFromUserSet(
        stream.streamUuid,
        stream.fromUser.userUuid
      );
      this.dataStore.userStreamRegistry.delete(stream.fromUser.userUuid);
    });
  }
  @action.bound
  private _updateRemoteStream(streams: AgoraStream[]) {
    streams.forEach((stream) => {
      const eduStream = new EduStream(stream);
      this.dataStore.streamByStreamUuid.set(stream.streamUuid, eduStream);
      this._addStream2UserSet(eduStream, stream.fromUser.userUuid);
      this.dataStore.userStreamRegistry.set(stream.fromUser.userUuid, true);
    });
  }
}
@Log.attach({ proxyMethods: false })
export class ShareStreamStateKeeper extends AgoraRteThread {
  private _timer?: any;
  private _cancelTimer?: () => void;
  private _timeout = 500;
  private _currentState: AgoraRteMediaSourceState =
    AgoraRteMediaSourceState.stopped;
  private _targetState: AgoraRteMediaSourceState =
    AgoraRteMediaSourceState.stopped;

  syncTo: (targetState: AgoraRteMediaSourceState) => Promise<void>;

  constructor(
    syncTo: (targetState: AgoraRteMediaSourceState) => Promise<void>
  ) {
    super();
    this.syncTo = syncTo;
  }

  async onExecution() {
    do {
      this.logger.debug(`thread notify start...`);

      if (this._currentState === this._targetState) {
        this.logger.info(`state synced.`);
        break;
      }

      if (!this.syncTo) {
        this.logger.warn(
          `no syncTo handler found, screen share state sync will not be possible`
        );
        break;
      }

      try {
        await this.syncTo(this._targetState);
        this._currentState = this._targetState;
        this.logger.info(`sync state to ${this._targetState} done`);
        break;
      } catch (e) {
        this.logger.error(`sync state failed: ${(e as Error).message}`);
        this._increaseTimeout();
      }

      await this._wait(this._timeout);
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }

  setShareScreenState(state: AgoraRteMediaSourceState) {
    if (state === AgoraRteMediaSourceState.starting) {
      //ignore starting state
      return;
    }
    this._targetState = state;
    //run immediately
    this._runImmediately();
  }

  run() {
    //reset timeout when run is called
    this._timeout = 500;
    super.run();
  }

  stop() {
    super.stop();
    this._cancelWait();
  }

  private _increaseTimeout() {
    if (this._timeout >= 10 * 1000) {
      //if current timeout is more than 10 seconds, don't increase
      return;
    }
    // otherwise increase timeout exponentially
    this._timeout = this._timeout * 2;
  }

  private _runImmediately() {
    this._cancelWait();
    this.run();
  }

  private async _wait(timeout: number) {
    this.logger.info(`wait for ${timeout}ms to retry`);
    await new Promise<void>((resolve) => {
      clearTimeout(this._timer);
      this._timer = setTimeout(resolve, timeout);
      this._cancelTimer = () => {
        this.logger.info(`cancel wait`);
        resolve();
      };
    });
  }

  private _cancelWait() {
    clearTimeout(this._timer);
    this._timer = undefined;
    this._cancelTimer && this._cancelTimer();
  }
}
