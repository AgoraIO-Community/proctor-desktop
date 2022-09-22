import { ClassState, EduClassroomConfig, LeaveReason } from "agora-edu-core";
import { bound, Log } from "agora-rte-sdk";
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  runInAction,
} from "mobx";
import { EduUIStoreBase } from "../base";

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];
  @observable
  exitProcessing = false;

  @observable
  roomClose = false; // 房间是否关闭

  @computed
  get userAvatar() {
    return typeof this.classroomStore.userStore.localUserProperties ===
      "undefined"
      ? ""
      : this.classroomStore.userStore.localUserProperties.get("avatar");
  }

  @action.bound
  toggleExistState(state?: boolean) {
    this.exitProcessing = state ? state : !this.exitProcessing;
  }

  generateGroupUuid = () => {
    const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
    const userUuidPrefix = userUuid.split("-")[0];
    return `${userUuidPrefix}-${roomUuid}`;
  };

  @action.bound
  exitRoom() {
    // leave room
    if (!this.exitProcessing) {
      this.toggleExistState();
      return false;
    }
    return true;
  }

  @bound
  async leaveMainClassroom() {
    await this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
  }

  @computed
  get teacherStream() {
    return "";
  }

  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.roomStore.classroomSchedule).observe(
        ({ newValue }) => {
          if (newValue.state === ClassState.close) {
            runInAction(() => {
              this.roomClose = true;
            });
          }
        }
      )
    );
  }

  onDestroy() {}
}
