import { AgoraEduSDK } from '@/infra/api';
import { useStore } from '@/infra/hooks/ui-store';
import { ClassState, EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { Button, Switch } from 'antd';
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import { LocalTrackPlayer } from '../../common/stream/track-player';
import './index.css';
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classState },
    usersUIStore: { studentListByUserUuidPrefix, filterTag },
    streamUIStore: { updateLocalPublishState },
    roomUIStore: { classStatusText, statusTextTip },
    classroomStore: {
      streamStore: { localCameraStreamUuid, localMicStreamUuid, streamByStreamUuid },
      roomStore: { updateClassState },
      widgetStore: { setActive },
      mediaStore: { localCameraTrackState, localMicTrackState, enableLocalVideo, enableLocalAudio },
    },
  } = useStore();
  const [cameraOpen, setCameraOpen] = useState(true);

  const startExam = async () => {
    await setActive('webView' + '-' + md5(AgoraEduSDK.examinationUrl), {
      position: { xaxis: 0, yaxis: 0 },
      extra: {
        webViewUrl: encodeURIComponent(AgoraEduSDK.examinationUrl),
      },
    });
    await startClass();
  };
  const endExam = async () => {
    updateClassState(ClassState.afterClass);
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
    updateLocalPublishState({ audioState: 1, videoState: cameraOpen ? 1 : 0 });
    enableLocalVideo(cameraOpen);
    enableLocalAudio(true);
  };
  const stopSpeak = () => {
    updateLocalPublishState({ audioState: 0, videoState: 0 });
    enableLocalVideo(false);
    enableLocalAudio(false);
  };
  return (
    <div className={'fcr_proctor_sider'}>
      <div>
        <div className={'fcr_proctor_sider_logo'}>
          <img src={require('../../common/logo.png')} width={146} />
        </div>
        <div className={'fcr_proctor_sider_info_wrap'}>
          <div className={'fcr_proctor_sider_info_room_number'}>
            <div className={'fcr_proctor_sider_info_title'}>RoomNumber</div>
            <div className={'fcr_proctor_sider_info_val'}>
              {EduClassroomConfig.shared.sessionInfo.roomUuid}
            </div>
          </div>
        </div>

        <div className={'fcr_proctor_sider_info_room_remaining'}>
          <div>
            <div className={'fcr_proctor_sider_info_title'}>{statusTextTip}</div>
            <div className={'fcr_proctor_sider_info_val'}>{classStatusText}</div>
          </div>
          <div>
            <SvgImg type={SvgIconEnum.PEOPLE}></SvgImg>
            <span>{studentListByUserUuidPrefix(filterTag).size}</span>
          </div>
        </div>
        <div className="fcr_proctor_sider_info_btn">
          {classState === ClassState.ongoing ? (
            <Button
              className="fcr_proctor_sider_info_end"
              type="primary"
              block
              size="large"
              onClick={endExam}>
              {transI18n('fcr_room_button_exam_end')}
            </Button>
          ) : (
            <Button
              className="fcr_proctor_sider_info_start"
              type="primary"
              block
              onClick={startExam}
              size="large">
              {transI18n('fcr_room_button_exam_start')}
            </Button>
          )}
        </div>
      </div>
      <div className="fcr_proctor_sider_info_proctor-actions">
        <div>
          <div
            className={`fcr_proctor_sider_info_proctor-actions-video-container ${
              localMicTrackState === AgoraRteMediaSourceState.started
                ? 'fcr_proctor_sider_info_proctor-actions-video-container-active'
                : ''
            }`}>
            <div className="fcr_proctor_sider_info_proctor-actions-video">
              {localMicTrackState === AgoraRteMediaSourceState.started && (
                <SvgImg
                  className={'fcr_proctor_sider_info_proctor-actions-video-volume'}
                  type={SvgIconEnum.VOLUME}></SvgImg>
              )}
              {localCameraTrackState === AgoraRteMediaSourceState.started ? (
                <LocalTrackPlayer></LocalTrackPlayer>
              ) : (
                <div className="fcr_proctor_sider_info_proctor-actions-video-placeholder">MY</div>
              )}
            </div>
          </div>
          <div className="fcr_proctor_sider_info_proctor-actions-name">
            {EduClassroomConfig.shared.sessionInfo.userName}
          </div>
        </div>

        <div className="fcr_proctor_sider_info_proctor-actions-btn">
          {(!localMicStreamUuid ||
            streamByStreamUuid.get(localMicStreamUuid)?.audioState ===
              AgoraRteMediaPublishState.Unpublished) &&
          (!localCameraStreamUuid ||
            streamByStreamUuid.get(localCameraStreamUuid)?.videoState ===
              AgoraRteMediaPublishState.Unpublished) ? (
            <BroadCastButtonGroup
              cameraOpen={cameraOpen}
              onCameraOpenChange={setCameraOpen}
              startSpeak={startSpeak}></BroadCastButtonGroup>
          ) : (
            <div className="fcr_proctor_sider_info_proctor-actions-video-group">
              {localCameraTrackState === AgoraRteMediaSourceState.started ? (
                <Button
                  className={'fcr_proctor_sider_info_proctor-actions-video-left'}
                  onClick={muteVideo}
                  block
                  type="primary"
                  danger>
                  <SvgImg size={36} type={SvgIconEnum.CAMERA_OFF}></SvgImg>
                </Button>
              ) : (
                <Button
                  className={'fcr_proctor_sider_info_proctor-actions-video-left'}
                  onClick={unMuteVideo}
                  block
                  type="primary">
                  <SvgImg
                    size={36}
                    type={SvgIconEnum.CAMERA_ON}
                    colors={{ iconPrimary: '#fff' }}></SvgImg>
                </Button>
              )}

              <Button
                className={'fcr_proctor_sider_info_proctor-actions-video-right'}
                onClick={stopSpeak}
                block
                type="primary"
                danger>
                <SvgImg type={SvgIconEnum.PHONE} size={36}></SvgImg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const BroadCastButtonGroup = ({
  startSpeak,
  onCameraOpenChange,
  cameraOpen,
}: {
  startSpeak: () => void;
  cameraOpen: boolean;
  onCameraOpenChange: (cameraOpen: boolean) => void;
}) => {
  const [showBroadCastOverlay, setShowBroadCastOverlay] = useState(false);
  const timer = useRef(-1);
  const showOverlay = useCallback(() => {
    window.clearTimeout(timer.current);
    setShowBroadCastOverlay(true);
  }, []);
  const closeOverlay = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setShowBroadCastOverlay(false);
    }, 300);
  }, []);
  return (
    <div className="fcr_proctor_sider_info_proctor-actions-speaker">
      <Button type="primary" onClick={startSpeak} block>
        <SvgImg type={SvgIconEnum.SPEAKER} size={36} />
        {transI18n('fcr_room_button_broadcast')}
      </Button>
      <div
        onMouseEnter={showOverlay}
        onMouseLeave={closeOverlay}
        className="fcr_proctor_sider_info_proctor-actions-speaker-extra">
        <SvgImg type={SvgIconEnum.EXTRA_VERTICAL} />
      </div>
      {showBroadCastOverlay && (
        <div
          onMouseEnter={showOverlay}
          onMouseLeave={closeOverlay}
          className="fcr_proctor_sider_info_proctor-actions-speaker-overlay">
          <div>
            <div>
              <SvgImg type={SvgIconEnum.CAMERA_ON} colors={{ iconPrimary: '#000' }}></SvgImg>
              <span>Camera</span>
            </div>

            <Switch
              checked={cameraOpen}
              checkedChildren="开启"
              unCheckedChildren="关闭"
              size="small"
              onChange={(checked) => {
                onCameraOpenChange(checked);
              }}></Switch>
          </div>
        </div>
      )}
    </div>
  );
};
