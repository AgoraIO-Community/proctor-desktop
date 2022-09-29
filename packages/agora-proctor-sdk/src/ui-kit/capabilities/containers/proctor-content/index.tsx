import { useStore } from "@/infra/hooks/ui-store";
import {
  StudentFilterTag,
  VideosWallLayoutEnum,
} from "@/infra/stores/common/type";
import { LeaveReason } from "agora-edu-core";
import { Button, Popover, Segmented, Tabs } from "antd";
import { observer } from "mobx-react";
import { useState } from "react";
import { SvgIconEnum, SvgImg, transI18n } from "~ui-kit";
import { AllVideos } from "../proctor-tabs/all-videos";
import { StudentDetail } from "../proctor-tabs/student-detail";
import { UserAbnormal, UserAvatar } from "../student-card";
export const ProctorContent = observer(() => {
  const {
    layoutUIStore: {
      studentTabItems,
      currentTab,
      setCurrentTab,
      removeStudentTab,
    },
    usersUIStore: {
      setVideosWallLayout,
      studentListByUserUuidPrefix,
      setFilterTag,
    },
  } = useStore();
  return (
    <div className="fcr-proctor-content">
      <Tabs
        activeKey={currentTab}
        onChange={(activeKey) => {
          setCurrentTab(activeKey);
        }}
        className="fcr-proctor-content-tabs"
        destroyInactiveTabPane
        hideAdd={true}
        type="editable-card"
        onEdit={(e, action) => {
          if (action === "remove") removeStudentTab(e as string);
        }}
        tabBarExtraContent={
          currentTab === "ALL_VIDEOS" && (
            <Segmented
              className="fcr-proctor-content-layout-segmented"
              onChange={(val) => {
                setVideosWallLayout(VideosWallLayoutEnum[val]);
              }}
              options={[
                {
                  label: (
                    <SvgImg
                      type={SvgIconEnum.LAYOUT_COMPACT}
                      size={36}
                    ></SvgImg>
                  ),
                  value: "Compact",
                },
                {
                  label: (
                    <SvgImg type={SvgIconEnum.LAYOUT_LOOSE} size={36}></SvgImg>
                  ),
                  value: "Loose",
                },
              ]}
            ></Segmented>
          )
        }
        items={[
          {
            label: (
              <div className="fcr-proctor-content-tab-label">
                <SvgImg type={SvgIconEnum.ALL_VIDEOS_TAB} />{" "}
                <span>{transI18n("fcr_room_label_all_videos")}</span>
              </div>
            ),
            key: "ALL_VIDEOS",
            children: <AllVideos />,
            closable: false,
          },
          ...studentTabItems.map((s) => {
            return {
              label: (
                <div className="fcr-proctor-content-tab-label">
                  <UserAvatar userUuidPrefix={s.key} />
                  <UserAbnormal userUuidPrefix={s.key} />
                  <span style={{ paddingLeft: "10px" }}>{s.label}</span>
                </div>
              ),
              key: s.key,
              children: <StudentDetail userUuidPrefix={s.key} />,
            };
          }),
        ]}
      ></Tabs>
      <div className="fcr-proctor-content-footer">
        <div className="fcr-proctor-content-footer-segmented">
          <Segmented
            className="fcr-proctor-content-tag-segmented"
            onChange={(val) => setFilterTag(val as StudentFilterTag)}
            options={[
              {
                label: (
                  <span>
                    {transI18n("fcr_room_tab_all")}·
                    {studentListByUserUuidPrefix(StudentFilterTag.All).size}
                  </span>
                ),
                value: StudentFilterTag.All,
              },
              {
                label: (
                  <span>
                    {transI18n("fcr_room_tab_abnormal")}·
                    {
                      studentListByUserUuidPrefix(StudentFilterTag.Abnormal)
                        .size
                    }
                  </span>
                ),
                value: StudentFilterTag.Abnormal,
              },
              {
                label: (
                  <span>
                    {transI18n("fcr_room_tab_focus")}·
                    {studentListByUserUuidPrefix(StudentFilterTag.Focus).size}
                  </span>
                ),
                value: StudentFilterTag.Focus,
              },
            ]}
          ></Segmented>
        </div>
        <div className="fcr-proctor-content-footer-leave">
          <LeaveBtnGroup></LeaveBtnGroup>
        </div>
      </div>
    </div>
  );
});

const LeaveBtnGroup = () => {
  const {
    classroomStore: {
      connectionStore: { leaveClassroomUntil },
    },
  } = useStore();
  const [showButtonPopover, setShowButtonPopover] = useState(false);
  const leave = () => {
    leaveClassroomUntil(LeaveReason.leave, Promise.resolve());
  };
  return (
    <div className="fcr-proctor-content-footer-leave-btn-group">
      <div>
        <Popover
          open={showButtonPopover}
          placement="topRight"
          overlayClassName="fcr-proctor-content-footer-leave-btn-group-popover"
          showArrow={false}
          content={
            <div>
              <Button
                style={{ marginBottom: "12px" }}
                type="primary"
                block
                danger
              >
                {transI18n("fcr_room_button_exam_end")}
              </Button>
              <Button type="ghost" onClick={leave} block danger>
                {transI18n("fcr_room_button_leave")}
              </Button>
            </div>
          }
        >
          {showButtonPopover ? (
            <Button onClick={() => setShowButtonPopover(false)} type="primary">
              {transI18n("fcr_exam_prep_button_cancel")}
            </Button>
          ) : (
            <Button
              onClick={() => setShowButtonPopover(true)}
              type="primary"
              danger
            >
              <SvgImg type={SvgIconEnum.QUIT} />{" "}
              <span>{transI18n("fcr_room_button_leave")}</span>
            </Button>
          )}
        </Popover>
      </div>
    </div>
  );
};
