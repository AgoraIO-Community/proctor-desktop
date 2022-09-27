import { useStore } from "@/infra/hooks/ui-store";
import { ClassroomState, ClassState, EduClassroomConfig } from "agora-edu-core";
import { AgoraRteMediaSourceState } from "agora-rte-sdk";
import { Button } from "antd";
import md5 from "js-md5";
import { observer } from "mobx-react";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { LocalTrackPlayer } from "../stream/track-player";
import "./index.css";
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classStatusText, classState },
    usersUIStore: { studentListByUserUuidPrefix, filterTag },
    classroomStore: {
      widgetStore: { setActive },
      mediaStore: { localCameraTrackState, enableLocalVideo, mediaControl },
    },
  } = useStore();

  const startExam = async () => {
    await setActive("webView" + "-" + md5("https://www.baidu.com"), {
      position: { xaxis: 0, yaxis: 0 },
      extra: {
        webViewUrl: encodeURIComponent("https://www.baidu.com"),
      },
    });
    await startClass();
  };
  const startSpeak = () => {
    enableLocalVideo(true);
  };
  const stopSpeak = () => {
    enableLocalVideo(false);
  };
  return (
    <div className={"fcr_proctor_sider"}>
      <div className={"fcr_proctor_sider_logo"}>灵动课堂</div>
      <div className={"fcr_proctor_sider_info_wrap"}>
        <div className={"fcr_proctor_sider_info_room_number"}>
          <div className={"fcr_proctor_sider_info_title"}>RoomNumber</div>
          <div className={"fcr_proctor_sider_info_val"}>
            {EduClassroomConfig.shared.sessionInfo.roomName}
          </div>
        </div>
        <div className={"fcr_proctor_sider_info_room_remaining"}>
          <div>
            <div className={"fcr_proctor_sider_info_title"}>TimeRemaining</div>
            <div className={"fcr_proctor_sider_info_val"}>
              {classStatusText}
            </div>
          </div>
          <div>
            <SvgImg type={SvgIconEnum.PEOPLE}></SvgImg>
            <span>{studentListByUserUuidPrefix(filterTag).size}</span>
          </div>
        </div>
        <div>
          {classState === ClassState.beforeClass ? (
            <Button type="primary" block onClick={startExam}>
              Start Exam
            </Button>
          ) : (
            <Button type="primary" block onClick={startClass}>
              End Exam
            </Button>
          )}
        </div>
      </div>
      <div className="fcr_proctor_sider_info_proctor-actions">
        <div className="fcr_proctor_sider_info_proctor-actions-video">
          <LocalTrackPlayer></LocalTrackPlayer>
        </div>
        <div className="fcr_proctor_sider_info_proctor-actions-name">
          {EduClassroomConfig.shared.sessionInfo.userName}
        </div>
        <div className="fcr_proctor_sider_info_proctor-actions-btn">
          {localCameraTrackState === AgoraRteMediaSourceState.stopped ? (
            <Button type="primary" onClick={startSpeak}>
              {"Speaker"}
            </Button>
          ) : (
            <Button onClick={stopSpeak} type="primary">
              {"Stop"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
