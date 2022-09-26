import { useStore } from "@/infra/hooks/ui-store";
import { ClassState, EduClassroomConfig } from "agora-edu-core";
import { Button } from "antd";
import md5 from "js-md5";
import { observer } from "mobx-react";
import { SvgIconEnum, SvgImg, transI18n } from "~ui-kit";
import "./index.css";
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classStatusText, classState },
    usersUIStore: { studentListByUserUuidPrefix, filterTag },
    classroomStore: {
      widgetStore: { setActive },
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
    </div>
  );
});
