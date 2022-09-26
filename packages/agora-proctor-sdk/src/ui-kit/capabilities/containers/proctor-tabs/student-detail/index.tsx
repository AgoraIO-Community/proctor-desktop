import { useStore } from "@/infra/hooks/ui-store";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { Select } from "antd";
import { observer } from "mobx-react";
import { SvgIconEnum, SvgImg, transI18n } from "~ui-kit";
import { StudentVideos } from "../../student-card";
import "./index.css";
export const StudentDetail = observer(({ userUuid }: { userUuid: string }) => {
  const {} = useStore();

  return (
    <div className="fcr-student-detail-tab">
      <div className="fcr-student-detail-tab-replay">
        <StudentVideos
          userUuid={userUuid}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-replay-bottom">
          <div className="fcr-student-detail-tab-replay-bottom-title">
            <Alarm></Alarm>
            <span>Review and information alarm（10）</span>
          </div>
          <div className="fcr-student-detail-tab-replay-bottom-list">
            <div className="fcr-student-detail-tab-replay-bottom-list-item">
              <div>10</div>
              <div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-logo">
                  <SvgImg type={SvgIconEnum.AI} size={36}></SvgImg>
                </div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-info">
                  <div className="fcr-student-detail-tab-replay-bottom-list-item-type">
                    02:23 Suspicious Behavior{" "}
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
          </div>
        </div>
      </div>
      <div className="fcr-student-detail-tab-live">
        <StudentVideos
          userUuid={userUuid}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-live-bottom">
          <div className="fcr-student-detail-tab-live-bottom-title">
            {transI18n("fcr_sub_room_label_monitor")}
          </div>
          <div className="fcr-student-detail-tab-live-bottom-suspicious">
            <div className="fcr-student-detail-tab-live-bottom-suspicious-title">
              {transI18n("fcr_sub_room_label_report_behavior")}
            </div>
            <Select></Select>
          </div>
        </div>
      </div>
      <div className="fcr-student-detail-tab-info"></div>
    </div>
  );
});

export const Alarm = () => {
  return (
    <div className="fcr-alarm">
      <SvgImg type={SvgIconEnum.ALARM} size={14}></SvgImg>
    </div>
  );
};
