import "./index.css";
import { observer } from "mobx-react";
import { StudentVideos } from "../../student-card";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { Select } from "antd";
export const StudentDetail = observer(() => {
  return (
    <div className="fcr-student-detail-tab">
      <div className="fcr-student-detail-tab-replay">
        <StudentVideos layout={VideosWallLayoutEnum.Compact} />
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
        <StudentVideos layout={VideosWallLayoutEnum.Compact} />
        <div className="fcr-student-detail-tab-live-bottom">
          <div className="fcr-student-detail-tab-live-bottom-title">
            Real Time Monitor
          </div>
          <div className="fcr-student-detail-tab-live-bottom-suspicious">
            <div className="fcr-student-detail-tab-live-bottom-suspicious-title">
              Report a suspicious behavior
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
