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

  @computed
  get userWarning() {
    return typeof this.classroomStore.userStore.localUserProperties ===
      "undefined"
      ? {}
      : this.classroomStore.userStore.localUserProperties.get("warning");
  }

  @action.bound
  toggleExistState(state?: boolean) {
    this.exitProcessing = state ? state : !this.exitProcessing;
  }

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

  openWebview = () => {
    this.extensionApi.openWebview({
      resourceUuid: "openwebview",
      url: "https://www.agora.io",
      title: "baidu",
    });
  };
  testToast = () => {
    // update user message
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    this.classroomStore.userStore.updateUserProperties([
      {
        userUuid,
        properties: { warning: { message: "你小心点", time: Date.now() } },
      },
    ]);
  };

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
    this._disposers.push(
      computed(() => this.userWarning).observe(({ newValue }) => {
        if (newValue?.message) {
          this.shareUIStore.addToast(newValue.message, "error");
        }
      })
    );
  }

  onDestroy() {}
}
