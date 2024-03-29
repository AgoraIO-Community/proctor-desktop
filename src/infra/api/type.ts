import {
  AgoraEduClassroomEvent,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduRtcConfig,
  Platform,
  AgoraCloudProxyType,
} from 'agora-edu-core';
import { AGVideoEncoderConfiguration, AGMediaOptions } from 'agora-rte-sdk';
import { FcrMultiThemeMode } from 'agora-common-libs';
import { AgoraCloudClassWidget as AgoraWidgetBase } from 'agora-common-libs';

export type AgoraRegion = Uppercase<AgoraRegionString>;

export const regionMap = {
  AP: 'sg',
  CN: 'cn-hz',
  EU: 'gb-lon',
  NA: 'us-sv',
} as const;

export type AgoraRegionString = 'cn' | 'ap' | 'na' | 'eu';

export type ListenerCallback = (evt: AgoraEduClassroomEvent, ...args: any[]) => void;

export enum WindowID {
  Main = 'main',
  RemoteControlBar = 'remote-control-bar',
}

export enum DeviceTypeEnum {
  Main = 'main',
  Sub = 'sub',
}

export type LanguageEnum = 'en' | 'zh';
export type TranslateEnum =
  | ''
  | 'auto'
  | 'zh-CHS'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'es'
  | 'pt'
  | 'it'
  | 'ru'
  | 'vi'
  | 'de'
  | 'ar';

export type ConfigParams = {
  appId: string;
  region?: string;
};

export type LaunchMediaOptions = AGMediaOptions & {
  lowStreamCameraEncoderConfiguration?: AGVideoEncoderConfiguration;
};

export type ConvertMediaOptionsConfig = EduRtcConfig & {
  defaultLowStreamCameraEncoderConfigurations?: AGVideoEncoderConfiguration;
};

/**
 * LaunchOption 接口
 */
export type LaunchOption = {
  userUuid: string; // 用户uuid
  userName: string; // 用户昵称
  roomUuid: string; // 房间uuid
  roleType: EduRoleTypeEnum; // 角色
  roomType: EduRoomTypeEnum; // 房间类型
  roomName: string; // 房间名称
  listener: ListenerCallback; // launch状态
  pretest: boolean; // 开启设备检测
  rtmToken: string; // rtmToken
  language: LanguageEnum; // 国际化
  startTime?: number; // 房间开始时间
  duration: number; // 课程时长
  widgets?: { [key: string]: typeof AgoraWidgetBase };
  userFlexProperties?: { [key: string]: any }; //用户自订属性
  mediaOptions?: LaunchMediaOptions;
  latencyLevel?: 1 | 2;
  platform?: Platform;
  uiMode?: FcrMultiThemeMode;
  shareUrl?: string; // 分享URL
  checkStudentScreenShareState?: boolean;
  rtcCloudProxyType?: AgoraCloudProxyType; // RTC 云代理类型
  rtmCloudProxyEnabled?: boolean; // 是否开启 RTM 云代理
};

/**
 *  运行窗口选项
 */
export type LaunchWindowOption = {
  windowID: WindowID; //窗口ID
  language: LanguageEnum; // 语言
  args: any; // 传入属性
  roomType: EduRoomTypeEnum;
  uiMode: FcrMultiThemeMode;
};

export { AgoraExtensionRoomEvent, AgoraExtensionWidgetEvent } from '../protocol/events';

export type BoardWindowAnimationOptions = {
  minFPS?: number;
  maxFPS?: number;
  resolution?: number;
  autoResolution?: boolean;
  autoFPS?: boolean;
};
