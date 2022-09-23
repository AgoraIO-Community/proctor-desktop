import { useStore } from "@/infra/hooks/ui-store";
import { EduStream } from "agora-edu-core";
import { AgoraRteScene, AGRenderMode } from "agora-rte-sdk";
import { observer } from "mobx-react";
import {
  useRef,
  FC,
  useEffect,
  CSSProperties,
  forwardRef,
  useImperativeHandle,
} from "react";
import { SvgIconEnum, SvgImg } from "~ui-kit";
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
export const RemoteTrackPlayer = observer(
  forwardRef<{ fullScreen: () => void }, RemoteTrackPlayerProps>(
    ({ style, className, stream, mirrorMode = false, fromScene }, ref) => {
      const {
        classroomStore: {
          streamStore: { setupRemoteVideo },
        },
      } = useStore();
      const playerContainerRef = useRef<HTMLDivElement | null>(null);
      useEffect(() => {
        if (playerContainerRef.current) {
          setupRemoteVideo(
            stream,
            playerContainerRef.current,
            mirrorMode,
            AGRenderMode.fit,
            fromScene
          );
        }
      }, [mirrorMode, setupRemoteVideo]);
      useImperativeHandle(ref, () => ({
        fullScreen: () => {
          playerContainerRef.current
            ?.querySelector("video")
            ?.requestFullscreen();
        },
      }));
      return (
        <div
          style={style}
          className={`fcr-track-player ${className}`}
          ref={playerContainerRef}
        ></div>
      );
    }
  )
);

export const RemoteTrackPlayerWithFullScreen: FC<RemoteTrackPlayerProps> =
  observer((props) => {
    const playerRef = useRef<{ fullScreen: () => void }>(null);
    return (
      <div className="fcr-track-player-fullscreen">
        <RemoteTrackPlayer {...props} ref={playerRef}></RemoteTrackPlayer>
        <div className="fcr-track-player-fullscreen-cover">
          <SvgImg
            className={"fcr-track-player-fullscreen-btn"}
            type={SvgIconEnum.VIDEO_FULLSCREEN}
            size={26}
            onClick={() => {
              playerRef.current?.fullScreen();
            }}
          ></SvgImg>
        </div>
      </div>
    );
  });
