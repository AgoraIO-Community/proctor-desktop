import { useStore } from "@/infra/hooks/ui-store";
import { ClassroomState, ClassState } from "agora-edu-core";
import { Button } from "antd";
import { observer } from "mobx-react";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import "./index.css";
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classStatusText, classState },
    usersUIStore: { studentListByUserUuidPrefix },
  } = useStore();
  return (
    <div className={"fcr_proctor_sider"}>
      <div className={"fcr_proctor_sider_logo"}>灵动课堂</div>
      <div className={"fcr_proctor_sider_info_wrap"}>
        <div className={"fcr_proctor_sider_info_room_number"}>
          <div className={"fcr_proctor_sider_info_title"}>RoomNumber</div>
          <div className={"fcr_proctor_sider_info_val"}>111 2222</div>
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
            <span>{studentListByUserUuidPrefix.size}</span>
          </div>
        </div>
        <div>
          {classState === ClassState.beforeClass ? (
            <Button type="primary" block onClick={startClass}>
              Start Exam
            </Button>
          ) : (
            <Button type="primary" block onClick={startClass}>
              End Exam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
