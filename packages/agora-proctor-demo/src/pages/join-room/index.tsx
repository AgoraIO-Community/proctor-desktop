import { EduRoleTypeEnum } from "agora-edu-core";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { AForm, AFormItem, AInput, useAForm, useI18n } from "~ui-kit";
import { UserApi } from "../../api/user";
import { RadioIcon } from "../../components/radio-icon";
import { useHistoryBack, useHomeStore } from "../../hooks";
import { useCheckRoomInfo } from "../../hooks/useCheckRoomInfo";
import { useJoinRoom } from "../../hooks/useJoinRoom";
import { useLoading } from "../../hooks/useLoading";
import { useNickNameRule } from "../../hooks/useNickNameRule";
import { useRoomIdRule } from "../../hooks/useRoomIdRule";
import { NavFooter, NavPageLayout } from "../../layout/nav-page-layout";
import { formatRoomID } from "../../utils";
import { ShareLink } from "../../utils/room";
import "./index.css";
type JoinFormValue = {
  roomId: string;
  nickName: string;
};

export const JoinRoom = observer(() => {
  const transI18n = useI18n();

  const roles = [
    {
      label: transI18n("fcr_joinroom_option_teacher"),
      value: EduRoleTypeEnum.teacher,
      backgroundColor: "#5765FF",
    },
    {
      label: transI18n("fcr_joinroom_option_student"),
      value: EduRoleTypeEnum.student,
      backgroundColor: "#F5655C",
    },
    {
      label: transI18n("fcr_joinroom_option_audience"),
      value: EduRoleTypeEnum.assistant,
      backgroundColor: "#83BC53",
    },
  ];

  const [role, setRole] = useState(roles[1].value);
  const { rule: roomIdRule } = useRoomIdRule();
  const { rule: nickNameRule } = useNickNameRule();
  const [form] = useAForm<JoinFormValue>();
  const { quickJoinRoom } = useJoinRoom();
  const { setLoading } = useLoading();
  const historyBackHandle = useHistoryBack();
  const query = ShareLink.instance.parseHashURLQuery(location.hash);
  const { checkRoomID } = useCheckRoomInfo();
  const homeStore = useHomeStore();

  useEffect(() => {
    if (query && query.roomId) {
      form.setFieldValue("roomId", formatRoomID(query.roomId));
    }
    // 将本地的区域和分享的区域对齐
    if (query && query.region) {
      homeStore.setRegion(query.region);
    }
    form.setFieldValue("nickName", UserApi.shared.nickName);
  }, []);

  const onSubmit = () => {
    form.validateFields().then((data) => {
      data.roomId = data.roomId.replace(/\s+/g, "");
      if (!checkRoomID(data.roomId)) {
        return;
      }
      setLoading(true);
      UserApi.shared.nickName = data.nickName;
      quickJoinRoom({
        role,
        roomId: data.roomId,
        nickName: data.nickName,
      }).finally(() => {
        setLoading(false);
      });
    });
  };

  const formOnValuesChange = (changeValues: any) => {
    if (changeValues.roomId) {
      const roomId: string = changeValues.roomId.replace(/[^0-9]/gi, "");
      if (roomId === "") {
        form.setFieldValue("roomId", "");
        return;
      }
      const formatId = formatRoomID(roomId);
      if (roomId !== formatId) {
        form.setFieldValue("roomId", formatId);
      }
    }
  };

  return (
    <NavPageLayout
      title={transI18n("fcr_joinroom_label_join")}
      className="join-room"
      footer={
        <NavFooter
          okText={transI18n("fcr_joinroom_button_confirm")}
          cancelText={transI18n("fcr_joinroom_button_cancel")}
          onOk={onSubmit}
          onCancel={historyBackHandle}
        />
      }
    >
      <AForm<JoinFormValue>
        className="join-form header-blank footer-blank"
        form={form}
        onValuesChange={formOnValuesChange}
      >
        <div className="form-item">
          <div className="label">{transI18n("fcr_joinroom_label_RoomID")}</div>
          <AFormItem name="roomId" rules={roomIdRule}>
            <AInput disabled={!!(query && query.roomId)} />
          </AFormItem>
        </div>
        <div className="form-item">
          <div className="label">{transI18n("fcr_joinroom_label_name")}</div>
          <AFormItem name="nickName" rules={nickNameRule}>
            <AInput maxLength={50} />
          </AFormItem>
        </div>
        <div className="form-item col-start-1 col-end-3">
          <div className="label">{transI18n("fcr_joinroom_label_role")}</div>
          <div className="role-choose">
            {roles.map((v) => {
              return (
                <div
                  key={v.value}
                  onClick={() => {
                    setRole(v.value);
                  }}
                  className="role-item"
                  style={{ backgroundColor: v.backgroundColor }}
                >
                  {v.label} <RadioIcon checked={v.value === role} />
                </div>
              );
            })}
          </div>
        </div>
      </AForm>
    </NavPageLayout>
  );
});