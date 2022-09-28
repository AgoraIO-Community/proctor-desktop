import "./index.css";
import { observer } from "mobx-react";
import {
  StudentHLSVideos,
  StudentVideos,
  UserAbnormal,
  UserAvatar,
  UserFocus,
} from "../../student-card";
import {
  UserAbnormal as UserAbnormalType,
  UserEvents,
  VideosWallLayoutEnum,
} from "@/infra/stores/common/type";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { Select, Button } from "antd";
import { useStore } from "@/infra/hooks/ui-store";
import { useEffect, useState, useCallback, useMemo } from "react";

import { EduClassroomConfig } from "agora-edu-core";
import { DeviceTypeEnum } from "@/infra/api";
export const StudentDetail = observer(
  ({ userUuidPrefix }: { userUuidPrefix: string }) => {
    const {
      usersUIStore: {
        queryUserEvents,
        updateUserTags,
        generateDeviceUuid,
        queryRecordList,
      },
      roomUIStore: { groupUuidByGroupName },
    } = useStore();
    const mainDeviceUserUuid = useMemo(() => {
      return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    }, []);
    const roomUuid = useMemo(() => {
      return groupUuidByGroupName(userUuidPrefix);
    }, []);
    const [userEvents, setUserEvents] = useState<
      UserEvents<{
        tags: {
          abnormal: UserAbnormalType;
        };
      }>[]
    >([]);
    const [abnormal, setAbnormal] = useState(undefined);
    const [recordList, setRecordList] = useState([]);

    const queryUserAbnormal = async () => {
      const res = await queryUserEvents(
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid
      );
      setUserEvents(res.list);
    };
    const queryRecords = async () => {
      queryRecordList(roomUuid!).then((res) => {
        setRecordList(res.list);
        console.log(res, "recordlist");
      });
    };
    useEffect(() => {
      queryUserAbnormal();
      queryRecords();
    }, []);
    const submitAbnormal = useCallback(async () => {
      await updateUserTags(
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid,
        {
          abnormal: {
            type: "warining",
            reason: "test",
          },
        }
      );
      queryUserAbnormal();
    }, [abnormal]);
    return (
      <div className="fcr-student-detail-tab">
        <div className="fcr-student-detail-tab-replay">
          <StudentHLSVideos
            mainDeviceScreenVideo={recordList[0]?.recordDetails?.[0].url}
            layout={VideosWallLayoutEnum.Compact}
          />
          <div className="fcr-student-detail-tab-replay-bottom">
            <div className="fcr-student-detail-tab-replay-bottom-title">
              <Alarm></Alarm>
              <span>Review and information alarm（{userEvents.length}）</span>
            </div>
            <div className="fcr-student-detail-tab-replay-bottom-list">
              {userEvents.reverse().map((e, index) => {
                return (
                  <div className="fcr-student-detail-tab-replay-bottom-list-item">
                    <div>{Math.abs(index - userEvents.length) + 1}</div>
                    <div>
                      <div className="fcr-student-detail-tab-replay-bottom-list-item-logo">
                        <SvgImg type={SvgIconEnum.AI} size={36}></SvgImg>
                      </div>
                      <div className="fcr-student-detail-tab-replay-bottom-list-item-info">
                        <div className="fcr-student-detail-tab-replay-bottom-list-item-type">
                          02:23 {e.data?.tags?.abnormal?.reason}
                        </div>
                        <div className="fcr-student-detail-tab-replay-bottom-list-item-desc">
                          Description From AI
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
          </div>
        </div>
        <div className="fcr-student-detail-tab-live">
          <StudentVideos
            showFullscreen
            userUuidPrefix={userUuidPrefix}
            layout={VideosWallLayoutEnum.Compact}
          />
          <div className="fcr-student-detail-tab-live-bottom">
            <div className="fcr-student-detail-tab-live-bottom-title">
              Real Time Monitor
            </div>
            <div className="fcr-student-detail-tab-live-bottom-suspicious">
              <div className="fcr-student-detail-tab-live-bottom-suspicious-title">
                Report a suspicious behavior
              </div>
              <div className="fcr-student-detail-tab-live-bottom-suspicious-btns">
                <Select
                  value={abnormal}
                  onChange={setAbnormal}
                  popupClassName={
                    "fcr-student-detail-tab-live-bottom-suspicious-select-popup"
                  }
                  className={
                    "fcr-student-detail-tab-live-bottom-suspicious-select"
                  }
                  size="large"
                  placeholder={"select one reason..."}
                  suffixIcon={<SvgImg type={SvgIconEnum.DROPDOWN}></SvgImg>}
                >
                  <Select.Option value={"test"}>test</Select.Option>
                </Select>
                <Button
                  onClick={submitAbnormal}
                  size="large"
                  type="primary"
                  className="fcr-student-detail-tab-live-bottom-suspicious-submit"
                >
                  Submit the suspicious behavior
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

          <UserFocus
            iconSize={35}
            size={50}
            userUuidPrefix={userUuidPrefix}
          ></UserFocus>
        </div>
      </div>
    );
  }
);

export const Alarm = () => {
  return (
    <div className="fcr-alarm">
      <SvgImg type={SvgIconEnum.ALARM} size={14}></SvgImg>
    </div>
  );
};
