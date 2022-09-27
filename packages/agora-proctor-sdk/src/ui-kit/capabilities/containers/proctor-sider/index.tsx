import { useStore } from "@/infra/hooks/ui-store";
import { ClassState, EduClassroomConfig } from "agora-edu-core";
import { AgoraRteMediaSourceState } from "agora-rte-sdk";
import { Button } from "antd";
import md5 from "js-md5";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { SvgIconEnum, SvgImg, transI18n } from "~ui-kit";
import { LocalTrackPlayer } from "../stream/track-player";
import "./index.css";
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classStatusText, classState },
    usersUIStore: { studentListByUserUuidPrefix, filterTag },
    streamUIStore: { updateLocalPublishState, teacherCameraStream },
    classroomStore: {
      widgetStore: { setActive },
      mediaStore: { localCameraTrackState, enableLocalVideo, enableLocalAudio },
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
  useEffect(() => {
    enableLocalVideo(false);
    enableLocalAudio(false);
  }, []);
  const muteVideo = () => {
    updateLocalPublishState({ videoState: 0 });
    enableLocalVideo(false);
  };
  const unMuteVideo = () => {
    updateLocalPublishState({ videoState: 1 });
    enableLocalVideo(true);
  };
  const startSpeak = () => {
    updateLocalPublishState({ audioState: 1, videoState: 1 });
    enableLocalVideo(true);
    enableLocalAudio(true);
  };
  const stopSpeak = () => {
    updateLocalPublishState({ audioState: 0, videoState: 0 });
    enableLocalVideo(false);
    enableLocalAudio(false);
  };

  return (
    <div className={"fcr_proctor_sider"}>
      <div className={"fcr_proctor_sider_logo"}>
        {transI18n("fcr_home_page_scene_option_online_proctoring")}
      </div>
      <div className={"fcr_proctor_sider_info_wrap"}>
        <div className={"fcr_proctor_sider_info_room_number"}>
          <div className={"fcr_proctor_sider_info_title"}>
            {transI18n("fcr_room_label_room_number")}
          </div>
          <div className={"fcr_proctor_sider_info_val"}>
            {EduClassroomConfig.shared.sessionInfo.roomName}
          </div>
        </div>
        <div className={"fcr_proctor_sider_info_room_remaining"}>
          <div>
            <div className={"fcr_proctor_sider_info_title"}>
              {transI18n("fcr_room_label_time_remaining")}
            </div>
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
              {transI18n("fcr_room_button_exam_start")}
            </Button>
          ) : (
            <Button type="primary" block onClick={startClass}>
              {transI18n("fcr_room_button_exam_end")}
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
          {teacherCameraStream?.isCameraMuted &&
          teacherCameraStream.isMicMuted ? (
            <Button
              className="fcr_proctor_sider_info_proctor-actions-speaker"
              type="primary"
              block
              onClick={startSpeak}
            >
              {"Speaker"}
            </Button>
          ) : (
            <div className="fcr_proctor_sider_info_proctor-actions-video-group">
              {localCameraTrackState === AgoraRteMediaSourceState.started ? (
                <Button
                  className={
                    "fcr_proctor_sider_info_proctor-actions-video-left"
                  }
                  onClick={muteVideo}
                  block
                  type="primary"
                  danger
                >
                  <SvgImg size={36} type={SvgIconEnum.CAMERA_OFF}></SvgImg>
                </Button>
              ) : (
                <Button
                  className={
                    "fcr_proctor_sider_info_proctor-actions-video-left"
                  }
                  onClick={unMuteVideo}
                  block
                  type="primary"
                >
                  <SvgImg size={36} type={SvgIconEnum.CAMERA_ON}></SvgImg>
                </Button>
              )}

              <Button
                className={"fcr_proctor_sider_info_proctor-actions-video-right"}
                onClick={stopSpeak}
                block
                type="primary"
                danger
              >
                <SvgImg type={SvgIconEnum.PHONE} size={36}></SvgImg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
