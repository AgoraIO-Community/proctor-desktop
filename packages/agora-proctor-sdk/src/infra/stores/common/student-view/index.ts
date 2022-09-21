import { LeaveReason } from "agora-edu-core";
import { Log, Logger } from "agora-rte-sdk";
import { action, computed, observable } from "mobx";
import { EduUIStoreBase } from "../base";

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  @observable
  exitProcessing = false;

  @computed
  get userAvatar() {
    const localUserProperties =
      this.classroomStore.userStore.localUserProperties;
    return typeof localUserProperties === "undefined"
      ? ""
      : localUserProperties.get("avatar");
  }

  @action.bound
  toggleExistState(state?: boolean) {
    this.exitProcessing = state ? state : !this.exitProcessing;
  }

  @action.bound
  async handleExistRoom() {
    // leave room
    if (!this.exitProcessing) {
      this.toggleExistState();
      return;
    }
    //

    // leave group room
    await Promise.resolve("leave user own room");
    // leave main room
    await this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
    Logger.info("leave room ");
  }

  @computed
  get teacherStream() {
    return "";
  }

  onInstall() {}

  onDestroy() {}
}
