import { ClassState, LeaveReason } from 'agora-edu-core';
import { bound, Log } from 'agora-rte-sdk';
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { EduUIStoreBase } from '../base';

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];
  @observable
  exitProcessing = false;

  @observable
  roomClose = false; // 房间是否关闭

  @observable
  widgetBlur = false;

  @observable
  counterOpening = false;

  @action.bound
  setCounterOpening(open: boolean) {
    this.counterOpening = open;
  }

  @computed
  get userAvatar() {
    return typeof this.classroomStore.userStore.localUserProperties === 'undefined'
      ? ''
      : this.classroomStore.userStore.localUserProperties.get('avatar');
  }

  @computed
  get userWarning() {
    return typeof this.classroomStore.userStore.localUserProperties === 'undefined'
      ? {}
      : this.classroomStore.userStore.localUserProperties.get('warning');
  }

  @computed
  get classRoomState() {
    return this.classroomStore.roomStore.classroomSchedule.state;
  }
  @computed
  get beforeClass() {
    return this.classRoomState === ClassState.beforeClass;
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
  onInstall() {
    this._disposers.push(
      reaction(
        () => this.classRoomState,
        (state) => {
          if (state === ClassState.beforeClass) {
            runInAction(() => {
              this.widgetBlur = true;
            });
          } else {
            runInAction(() => {
              this.widgetBlur = false;
            });
          }
        },
      ),
    );

    this._disposers.push(
      computed(() => this.userWarning).observe(({ newValue }) => {
        if (newValue?.message) {
          this.shareUIStore.addToast(newValue.message, 'error');
        }
      }),
    );

    // class is end
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.classroomSchedule.state,
        (state) => {
          if (ClassState.beforeClass === state) {
            runInAction(() => {
              this.widgetBlur = true;
            });
          } else {
            runInAction(() => {
              this.widgetBlur = false;
            });
          }

          if (ClassState.close === state) {
            runInAction(() => {
              this.roomClose = true;
            });
          }
        },
      ),
    );
  }

  onDestroy() {}
}
