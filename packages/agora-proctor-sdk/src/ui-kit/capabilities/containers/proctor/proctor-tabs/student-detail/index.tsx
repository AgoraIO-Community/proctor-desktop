import { useStore } from '@/infra/hooks/ui-store';
import {
  UserAbnormal as IUserAbnormal,
  UserAbnormalReason,
  UserAbnormalType,
  UserEvents,
  VideosWallLayoutEnum,
} from '@/infra/stores/common/type';
import { Button, Select } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import {
  StudentHLSVideos,
  StudentVideos,
  UserAbnormal,
  UserAvatar,
  UserFocus,
} from '../../proctor-student-card';
import './index.css';

import { DeviceTypeEnum } from '@/infra/api';
import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteVideoSourceType } from 'agora-rte-sdk';
import './index.css';
export const StudentDetail = observer(({ userUuidPrefix }: { userUuidPrefix: string }) => {
  const {
    roomUIStore: { roomSceneByRoomUuid },
    usersUIStore: {
      queryUserEvents,
      updateUserTags,
      generateDeviceUuid,
      queryRecordList,
      generateGroupUuid,
    },
  } = useStore();
  const studentHlsVideosRef = useRef<{
    seek: (time: number) => void;
  }>(null);
  const mainDeviceUserUuid = useMemo(() => {
    return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
  }, []);
  const subDeviceUserUuid = useMemo(() => {
    return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub);
  }, []);
  const roomUuid = useMemo(() => {
    return generateGroupUuid(userUuidPrefix);
  }, []);
  const roomScene = roomSceneByRoomUuid(roomUuid);

  const [userEvents, setUserEvents] = useState<
    UserEvents<{
      abnormal: IUserAbnormal;
    }>[]
  >([]);
  const [abnormal, setAbnormal] = useState(undefined);
  const [startTime, setStartTime] = useState(0);
  const [recordList, setRecordList] = useState<
    {
      startTime: number;
      recordDetails: {
        streamUuid: string;
        type: 'audio' | 'video' | 'av';
        url: string;
        startTime: number;
      }[];
    }[]
  >([]);

  const queryUserAbnormal = async () => {
    const res = await queryUserEvents(
      EduClassroomConfig.shared.sessionInfo.roomUuid,
      mainDeviceUserUuid,
      1600,
      'tags',
      'abnormal',
    );
    setUserEvents(
      (
        res.list as UserEvents<{
          abnormal: IUserAbnormal;
        }>[]
      ).sort((a, b) => b.sequence - a.sequence),
    );
  };
  const queryRecords = async () => {
    queryRecordList(roomUuid!).then((res) => {
      setRecordList(res.list);
    });
  };
  useEffect(() => {
    queryUserAbnormal();
    queryRecords();
  }, []);
  const submitAbnormal = useCallback(async () => {
    await updateUserTags(
      'abnormal',
      UserAbnormals.find((i) => i.reason === abnormal),
      EduClassroomConfig.shared.sessionInfo.roomUuid,
      mainDeviceUserUuid,
    );
    queryUserAbnormal();
  }, [abnormal]);

  const currentRecord = useMemo(() => {
    return recordList[recordList.length - 1 < 0 ? 0 : recordList.length - 1];
  }, [recordList]);

  const mainDeviceScreenVideo = currentRecord?.recordDetails?.find((i) => {
    return (
      i.type === 'video' &&
      roomScene?.streamController?.streamByStreamUuid.get(i.streamUuid)?.videoSourceType ===
        AgoraRteVideoSourceType.ScreenShare
    );
  });

  const mainDeviceCameraVideo = currentRecord?.recordDetails?.find((i) => {
    return (
      i.type === 'av' &&
      Array.from(roomScene?.streamController?.streamByUserUuid.get(mainDeviceUserUuid) || []).find(
        (i) =>
          roomScene?.streamController?.streamByStreamUuid.get(i)?.videoSourceType ===
          AgoraRteVideoSourceType.Camera,
      ) === i.streamUuid
    );
  });
  const subDeviceCameraVideo = currentRecord?.recordDetails?.find((i) => {
    return (
      i.type === 'video' &&
      Array.from(roomScene?.streamController?.streamByUserUuid.get(subDeviceUserUuid) || []).find(
        (i) =>
          roomScene?.streamController?.streamByStreamUuid.get(i)?.videoSourceType ===
          AgoraRteVideoSourceType.Camera,
      ) === i.streamUuid
    );
  });
  useEffect(() => {
    if (currentRecord && currentRecord.startTime !== startTime) {
      setStartTime(currentRecord.startTime);
    }
  }, [currentRecord, startTime]);
  const onUserEventClick = (ts: number) => {
    studentHlsVideosRef.current?.seek(dayjs.duration(Math.abs(ts - startTime), 'ms').asSeconds());
  };
  const { userAbnormalsI18nMap } = useUserAbnormalsI18n();
  return (
    <div className="fcr-student-detail-tab">
      <div className="fcr-student-detail-tab-replay">
        <StudentHLSVideos
          ref={studentHlsVideosRef}
          mainDeviceScreenVideo={mainDeviceScreenVideo?.url}
          mainDeviceCameraVideo={mainDeviceCameraVideo?.url}
          subDeviceCameraVideo={subDeviceCameraVideo?.url}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-replay-bottom">
          <div className="fcr-student-detail-tab-replay-bottom-title">
            <Alarm></Alarm>
            <span>
              {transI18n('fcr_sub_room_label_replay')}（{userEvents.length}）
            </span>
          </div>
          <UserEventsList
            userEvents={userEvents}
            startTime={startTime}
            onEventClick={onUserEventClick}></UserEventsList>
        </div>
      </div>
      <div className="fcr-student-detail-tab-live">
        <StudentVideos
          showFullscreen
          showTag
          userUuidPrefix={userUuidPrefix}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-live-bottom">
          <div className="fcr-student-detail-tab-live-bottom-title">
            {transI18n('fcr_sub_room_label_monitor')}
          </div>
          <div className="fcr-student-detail-tab-live-bottom-suspicious">
            <div className="fcr-student-detail-tab-live-bottom-suspicious-title">
              {transI18n('fcr_sub_room_label_report_behavior')}
            </div>
            <div className="fcr-student-detail-tab-live-bottom-suspicious-btns">
              <Select
                getPopupContainer={(container) => container}
                value={abnormal}
                onChange={setAbnormal}
                popupClassName={'fcr-student-detail-tab-live-bottom-suspicious-select-popup'}
                className={'fcr-student-detail-tab-live-bottom-suspicious-select'}
                size="large"
                placeholder={transI18n('fcr_sub_room_option_report_behavior_default')}
                suffixIcon={<SvgImg type={SvgIconEnum.DROPDOWN}></SvgImg>}>
                {UserAbnormals.map((i) => {
                  return (
                    <Select.Option key={i.reason} value={i.reason}>
                      {userAbnormalsI18nMap[i.reason]}
                    </Select.Option>
                  );
                })}
              </Select>
              <Button
                onClick={submitAbnormal}
                disabled={!abnormal}
                size="large"
                type="primary"
                className="fcr-student-detail-tab-live-bottom-suspicious-submit">
                {transI18n('fcr_sub_room_button_report_behavior_submit')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="fcr-student-detail-tab-info">
        <UserAvatar size={40} userUuidPrefix={userUuidPrefix}>
          <div className="fcr-student-detail-tab-info-abnormal">
            <UserAbnormal userUuidPrefix={userUuidPrefix} />
          </div>
        </UserAvatar>

        <UserFocus iconSize={35} size={50} userUuidPrefix={userUuidPrefix}></UserFocus>
      </div>
    </div>
  );
});

export const Alarm = () => {
  return (
    <div className="fcr-alarm">
      <SvgImg type={SvgIconEnum.ALARM} size={24}></SvgImg>
    </div>
  );
};
const useUserAbnormalsI18n = () => {
  const userAbnormalsI18nMap = useMemo(
    () => ({
      [UserAbnormalReason.Electronic_Devices]: transI18n(
        'fcr_sub_room_option_report_electronic_devices',
      ),
      [UserAbnormalReason.ID_Verification]: transI18n('fcr_sub_room_option_report_ID_verification'),
      [UserAbnormalReason.Multiple_People]: transI18n('fcr_sub_room_option_report_multiple_people'),
      [UserAbnormalReason.Paperworks]: transI18n('fcr_sub_room_option_report_paperworks'),
      [UserAbnormalType.Screen_Disconnected]: transI18n('fcr_sub_room_label_web_disconnected'),
    }),
    [],
  );
  const userAbnormalTypeI18nMap = useMemo(
    () => ({
      [UserAbnormalType.Ai]: transI18n('fcr_sub_room_label_AI_description'),
      [UserAbnormalType.Manual]: transI18n('fcr_sub_room_label_Human_description'),
      [UserAbnormalType.Screen_Disconnected]: transI18n('fcr_sub_room_label_web_disconnected'),
    }),
    [],
  );
  return { userAbnormalsI18nMap, userAbnormalTypeI18nMap };
};

const UserAbnormals: IUserAbnormal[] = [
  { reason: UserAbnormalReason.Electronic_Devices, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.ID_Verification, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.Multiple_People, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.Paperworks, type: UserAbnormalType.Manual },
];

export const UserEventsList = observer(
  ({
    userEvents,
    onEventClick,
    startTime,
  }: {
    startTime: number;
    userEvents: UserEvents<{
      abnormal: IUserAbnormal;
    }>[];
    onEventClick: (timestamp: number) => void;
  }) => {
    const { userAbnormalsI18nMap, userAbnormalTypeI18nMap } = useUserAbnormalsI18n();
    const [currentEvent, setCurrentEvent] = useState(-1);
    return (
      <div className="fcr-student-detail-tab-replay-bottom-list">
        {userEvents.map((e, index) => {
          return (
            <div
              key={e.ts}
              className={`fcr-student-detail-tab-replay-bottom-list-item ${
                currentEvent === e.sequence
                  ? 'fcr-student-detail-tab-replay-bottom-list-item-active'
                  : ''
              }`}
              onClick={() => {
                onEventClick(e.ts);
                setCurrentEvent(e.sequence);
              }}>
              <div>{Math.abs(index - userEvents.length)}</div>
              <div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-logo">
                  <SvgImg type={SvgIconEnum.AI} size={36}></SvgImg>
                </div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-info">
                  <div className="fcr-student-detail-tab-replay-bottom-list-item-type">
                    {dayjs
                      .duration(startTime === 0 ? 0 : Math.abs(e.ts - startTime), 'ms')
                      .format('HH:mm:ss')}{' '}
                    {userAbnormalsI18nMap[e.data?.abnormal?.reason]}
                  </div>
                  <div className="fcr-student-detail-tab-replay-bottom-list-item-desc">
                    {userAbnormalTypeI18nMap[e.data?.abnormal?.type]}
                  </div>
                </div>
              </div>
              <div>
                <SvgImg type={SvgIconEnum.REPLAY} size={35}></SvgImg>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
