import { useStore } from "@/infra/hooks/ui-store";
import { EduStream } from "agora-edu-core";
import { AgoraRteScene, AGRenderMode } from "agora-rte-sdk";
import { observer } from "mobx-react";
import { useRef, FC, useEffect, CSSProperties } from "react";
import "./index.css";
type RemoteTrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
  mirrorMode?: boolean;
  fromScene?: AgoraRteScene;
};

type LocalTrackPlayerProps = Omit<RemoteTrackPlayerProps, "stream">;
export const LocalTrackPlayer: FC<LocalTrackPlayerProps> = observer(
  ({ style, className }) => {
    const {
      streamUIStore: { setupLocalVideo, isMirror },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupLocalVideo(ref.current, isMirror);
      }
    }, [isMirror, setupLocalVideo]);

    return (
      <div
        style={style}
        className={`fcr-track-player ${className}`}
        ref={ref}
      ></div>
    );
  }
);
export const RemoteTrackPlayer: FC<RemoteTrackPlayerProps> = observer(
  ({ style, className, stream, mirrorMode = false, fromScene }) => {
    const {
      classroomStore: {
        streamStore: { setupRemoteVideo },
      },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (ref.current) {
        setupRemoteVideo(
          stream,
          ref.current,
          mirrorMode,
          AGRenderMode.fit,
          fromScene
        );
      }
    }, [mirrorMode, setupRemoteVideo]);

    return (
      <div
        style={style}
        className={`fcr-track-player ${className}`}
        ref={ref}
      ></div>
    );
  }
);
