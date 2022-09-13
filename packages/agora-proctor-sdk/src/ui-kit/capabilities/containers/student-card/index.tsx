import "./index.css";
import { useEffect } from "react";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { useStore } from "@/infra/hooks/ui-store";
import { LocalTrackPlayer } from "../stream/track-player";
import { observer } from "mobx-react";
export const StudentCard = observer(() => {
  const {
    layoutUIStore: { addStudentTab, videosWallLayout },
  } = useStore();
  useEffect(() => {
    console.log("render");
  }, []);

  return (
    <div
      className="fcr-student-card"
      onClick={() => addStudentTab("test", "test")}
    >
      <StudentVideos layout={videosWallLayout} />
      <div className="fcr-student-card-extra">
        <div className="fcr-student-card-user">
          <div className="fcr-student-card-user-avatar"></div>
          <div className="fcr-student-card-user-name">aaa</div>
        </div>
        <div className="fcr-student-card-actions">
          <div className="fcr-student-card-actions-like"></div>
          <div className="fcr-student-card-actions-chat"></div>
          <div className="fcr-student-card-actions-warning"></div>
        </div>
      </div>
    </div>
  );
});

export const StudentVideos = observer(
  ({ layout }: { layout: VideosWallLayoutEnum }) => {
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? "fcr-student-card-videos-compact"
            : "fcr-student-card-videos-loose"
        }`}
      >
        <div className="fcr-student-card-videos-screen"></div>
        <div className="fcr-student-card-videos-camera">
          <LocalTrackPlayer></LocalTrackPlayer>
        </div>
        <div className="fcr-student-card-videos-mobile"></div>
      </div>
    );
  }
);
