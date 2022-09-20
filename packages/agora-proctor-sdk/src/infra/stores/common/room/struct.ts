import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
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
  AgoraRteConnectionState,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraRteSceneJoinRTCOptions,
  AgoraStream,
  AGRtcConnectionType,
  Injectable,
  Logger,
  RtcState,
} from "agora-rte-sdk";
import to from "await-to-js";
import { action, computed, observable } from "mobx";

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
  @observable rtcState?: Map<AGRtcConnectionType, RtcState>;
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
    this.streamController = new StreamController(scene);
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
    streamByStreamUuid: Map<string, EduStream>;
    streamByUserUuid: Map<string, Set<string>>;
    userStreamRegistry: Map<string, boolean>;
    streamVolumes: Map<string, number>;
  } = {
    streamByStreamUuid: new Map(),
    streamByUserUuid: new Map(),
    userStreamRegistry: new Map(),
    streamVolumes: new Map(),
  };
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
  constructor(private _scene: AgoraRteScene) {
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
