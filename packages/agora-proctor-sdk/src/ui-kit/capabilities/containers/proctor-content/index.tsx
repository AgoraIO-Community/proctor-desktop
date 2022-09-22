import "./index.css";
import { Tabs, Segmented, Button, Popover } from "antd";
import { AllVideos } from "../proctor-tabs/all-videos";
import { SvgIconEnum, SvgImg } from "~ui-kit";
import { useStore } from "@/infra/hooks/ui-store";
import { observer } from "mobx-react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useState } from "react";
import { StudentDetail } from "../proctor-tabs/student-detail";
export const ProctorContent = observer(() => {
  const {
    layoutUIStore: {
      studentTabItems,
      currentTab,
      setCurrentTab,
      removeStudentTab,
    },
    usersUIStore: { setVideosWallLayout },
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
                    <SvgImg
                      type={SvgIconEnum.LAYOUT_COMPACT}
                      size={36}
                    ></SvgImg>
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
                <span>All Videos</span>
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
                  <SvgImg type={SvgIconEnum.ALL_VIDEOS_TAB} />{" "}
                  <span>{s.label}</span>
                </div>
              ),
              key: s.key,
              children: <StudentDetail userUuid={s.key} />,
            };
          }),
        ]}
      ></Tabs>
      <div className="fcr-proctor-content-footer">
        <div className="fcr-proctor-content-footer-segmented">
          <Segmented
            className="fcr-proctor-content-tag-segmented"
            options={["All", "Abnormal", "Focus"]}
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
  const [showButtonPopover, setShowButtonPopover] = useState(false);
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
                End the Exam
              </Button>
              <Button type="ghost" block danger>
                Leave the Room
              </Button>
            </div>
          }
        >
          {showButtonPopover ? (
            <Button onClick={() => setShowButtonPopover(false)} type="primary">
              Cancel
            </Button>
          ) : (
            <Button
              onClick={() => setShowButtonPopover(true)}
              type="primary"
              danger
            >
              <SvgImg type={SvgIconEnum.QUIT} /> <span>Leave</span>
            </Button>
          )}
        </Popover>
      </div>
    </div>
  );
};
