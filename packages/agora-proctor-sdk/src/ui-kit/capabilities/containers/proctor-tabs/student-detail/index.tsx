import "./index.css";
import { observer } from "mobx-react";
import { StudentVideos } from "../../student-card";
import {
  UserAbnormal,
  UserEvents,
  VideosWallLayoutEnum,
} from "@/infra/stores/common/type";
import { Button, SvgIconEnum, SvgImg } from "~ui-kit";
import { Select } from "antd";
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
        generateGroupUuid,
        queryRecordList,
      },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = useMemo(() => {
      return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    }, []);
    const roomUuid = useMemo(() => {
      return generateGroupUuid(userUuidPrefix);
    }, []);
    const [userEvents, setUserEvents] = useState<
      UserEvents<{
        tags: {
          abnormal: UserAbnormal;
        };
      }>[]
    >([]);
    const [abnormal, setAbnormal] = useState("");
    const queryUserAbnormal = async () => {
      const res = await queryUserEvents(
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid
      );
      setUserEvents(res.list);
    };
    const queryRecords = async () => {
      queryRecordList(roomUuid).then((res) => {
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
          <StudentVideos
            userUuidPrefix={userUuidPrefix}
            layout={VideosWallLayoutEnum.Compact}
          />
          <div className="fcr-student-detail-tab-replay-bottom">
            <div className="fcr-student-detail-tab-replay-bottom-title">
              <Alarm></Alarm>
              <span>Review and information alarm（{userEvents.length}）</span>
            </div>
            <div className="fcr-student-detail-tab-replay-bottom-list">
              {userEvents.map((e, index) => {
                return (
                  <div className="fcr-student-detail-tab-replay-bottom-list-item">
                    <div>{index}</div>
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
                  placeholder={"select one reason"}
                >
                  <Select.Option value={"test"}>test</Select.Option>
                </Select>
                <Button onClick={submitAbnormal} size="lg">
                  Submit the suspicious behavior
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="fcr-student-detail-tab-info"></div>
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
