import { AGError, AgoraRteLogLevel, Log } from 'agora-rte-sdk';
import { DeviceSettingUIStore } from './device-setting/index';
import { NavigationBarUIStore } from './nav-ui';
import { EduShareUIStore } from './share-ui';
import { StreamUIStore } from './stream';
import { LayoutUIStore } from './layout';
import { EduUIStoreBase } from './base';
import { NotificationUIStore } from './notification-ui';
import { PretestUIStore } from './pretest';
import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduClassroomStore,
  LeaveReason,
} from 'agora-edu-core';
import { WidgetUIStore } from './widget';
import { GroupUIStore } from './group-ui';
import { ConvertMediaOptionsConfig } from '@/infra/api';
import { SubscriptionUIStore } from './subscription';
import { transI18n } from '~ui-kit';
@Log.attach({ level: AgoraRteLogLevel.INFO })
export class EduClassroomUIStore {
  protected _classroomStore: EduClassroomStore;
  protected _shareUIStore: EduShareUIStore;
  protected _streamUIStore: StreamUIStore;
  protected _deviceSettingUIStore: DeviceSettingUIStore;
  protected _navigationBarUIStore: NavigationBarUIStore;
  protected _layoutUIStore: LayoutUIStore;
  protected _notificationUIStore: NotificationUIStore;
  protected _pretestUIStore: PretestUIStore;
  protected _widgetUIStore: WidgetUIStore;
  protected _groupUIStore: GroupUIStore;
  protected _subscriptionUIStore: SubscriptionUIStore;
  private _installed = false;

  constructor(store: EduClassroomStore) {
    this._classroomStore = store;
    this._shareUIStore = new EduShareUIStore();
    this._streamUIStore = new StreamUIStore(store, this.shareUIStore);
    this._pretestUIStore = new PretestUIStore(store, this.shareUIStore);
    this._deviceSettingUIStore = new DeviceSettingUIStore(store, this.shareUIStore);
    this._navigationBarUIStore = new NavigationBarUIStore(store, this.shareUIStore);
    this._layoutUIStore = new LayoutUIStore(store, this.shareUIStore);
    this._notificationUIStore = new NotificationUIStore(store, this.shareUIStore);
    this._widgetUIStore = new WidgetUIStore(store, this.shareUIStore);
    this._groupUIStore = new GroupUIStore(store, this.shareUIStore);
    this._subscriptionUIStore = new SubscriptionUIStore(store, this.shareUIStore);
  }

  /**
   * getters
   */
  get classroomStore() {
    return this._classroomStore;
  }
  get shareUIStore() {
    return this._shareUIStore;
  }

  get streamUIStore() {
    return this._streamUIStore;
  }
  get deviceSettingUIStore() {
    return this._deviceSettingUIStore;
  }
  get navigationBarUIStore() {
    return this._navigationBarUIStore;
  }
  get layoutUIStore() {
    return this._layoutUIStore;
  }
  get notificationUIStore() {
    return this._notificationUIStore;
  }
  get pretestUIStore() {
    return this._pretestUIStore;
  }
  get widgetUIStore() {
    return this._widgetUIStore;
  }
  get groupUIStore() {
    return this._groupUIStore;
  }


  /**
   * 初始化所有 UIStore
   * @returns
   */
  initialize() {
    if (this._installed) {
      return;
    }
    this._installed = true;

    //initialize domain stores
    this.classroomStore.initialize();

    //initialize ui stores
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onInstall();
        }
      }
    });

    const { initialize } = this.classroomStore.connectionStore;

    initialize();

    //@ts-ignore
    window.globalStore = this;
  }

  /**
   * 加入教室，之后加入 RTC 频道
   */
  async join() {
    const { joinClassroom, joinRTC } = this.classroomStore.connectionStore;
    try {
      await joinClassroom();
    } catch (e) {
      if (AGError.isOf(e as AGError, AGServiceErrorCode.SERV_CANNOT_JOIN_ROOM)) {
        return this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
      } else {
        return this.classroomStore.connectionStore.leaveClassroomUntil(
          LeaveReason.leave,
          new Promise((resolve) => {
            this.shareUIStore.addGenericErrorDialog(e as AGError, {
              onOK: resolve,
              okBtnText: transI18n('toast.leave_room'),
            });
          }),
        );
      }
    }
    // 默认开启大小流
    // if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
    try {
      const launchLowStreamCameraEncoderConfigurations = (
        EduClassroomConfig.shared.rteEngineConfig.rtcConfigs as ConvertMediaOptionsConfig
      )?.defaultLowStreamCameraEncoderConfigurations;

      await this.classroomStore.mediaStore.enableDualStream(true);

      await this.classroomStore.mediaStore.setLowStreamParameter(
        launchLowStreamCameraEncoderConfigurations ||
          EduClassroomConfig.defaultLowStreamParameter(),
      );
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
    // }

    try {
      await joinRTC();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 销毁所有 UIStore
   */
  destroy() {
    Object.getOwnPropertyNames(this).forEach((propertyName) => {
      if (propertyName.endsWith('UIStore')) {
        const uiStore = this[propertyName as keyof EduClassroomUIStore];

        if (uiStore instanceof EduUIStoreBase) {
          uiStore.onDestroy();
        }
      }
    });

    this.classroomStore.destroy();
  }
}
