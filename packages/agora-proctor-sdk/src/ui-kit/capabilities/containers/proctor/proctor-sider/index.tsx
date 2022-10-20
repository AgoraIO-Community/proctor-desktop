import { AgoraEduSDK } from '@/infra/api';
import { useStore } from '@/infra/hooks/ui-store';
import { AgoraButton } from '@/ui-kit/components/button';
import { ClassState, DEVICE_DISABLE, EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { Button, Switch } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import { LocalTrackPlayer } from '../../common/stream/track-player';
import { BtnWithCloseCheck } from '../../examinee/sider/room-operation';
import './index.css';
export const ProctorSider = observer(() => {
  const {
    navigationBarUIStore: { startClass, classState },
    usersUIStore: { studentListByUserUuidPrefix, filterTag, generateShortUserName },
    roomUIStore: { classStatusText, statusTextTip },

    classroomStore: {
      streamStore: { localCameraStreamUuid, localMicStreamUuid, streamByStreamUuid },
      roomStore: { updateClassState },
      mediaStore: { localCameraTrackState, localMicTrackState },
    },
  } = useStore();

  const endExam = async () => {
    updateClassState(ClassState.afterClass);
  };
  const isBroadCasting =
    (localMicStreamUuid &&
      streamByStreamUuid.get(localMicStreamUuid)?.audioState ===
        AgoraRteMediaPublishState.Published) ||
    (localCameraStreamUuid &&
      streamByStreamUuid.get(localCameraStreamUuid)?.videoState ===
        AgoraRteMediaPublishState.Published);
  return (
    <div className={'fcr_proctor_sider'}>
      <div>
        <div className={'fcr_proctor_sider_logo'}>
          <img src={require('../../common/logo.png')} width={146} />
        </div>
        <div className={'fcr_proctor_sider_info_wrap'}>
          <div className={'fcr_proctor_sider_info_room_number'}>
            <div className={'fcr_proctor_sider_info_title'}>
              {transI18n('fcr_room_label_room_number')}
            </div>
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
            <BtnWithCloseCheck
              fullWidth
              foldBtn={
                <Button className="fcr_proctor_sider_info_end" type="primary" block size="large">
                  {transI18n('fcr_room_button_exam_end')}
                </Button>
              }
              unFoldBtn={
                <AgoraButton size="middle" type="primary" subType="red" shape="round">
                  {transI18n('fcr_room_button_leave_confirm')}
                </AgoraButton>
              }
              onClick={endExam}></BtnWithCloseCheck>
          ) : (
            <Button
              className="fcr_proctor_sider_info_start"
              type="primary"
              block
              onClick={startClass}
              size="large">
              {transI18n('fcr_room_button_exam_start')}
            </Button>
          )}
        </div>
      </div>
      <div
        className="fcr_proctor_sider_info_proctor-actions"
        style={isBroadCasting ? { maxHeight: '353px' } : { maxHeight: '225px' }}>
        <div>
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
                  <div className="fcr_proctor_sider_info_proctor-actions-video-placeholder">
                    {generateShortUserName(EduClassroomConfig.shared.sessionInfo.userName)}
                  </div>
                )}
              </div>
            </div>

            <div className="fcr_proctor_sider_info_proctor-actions-name">
              {EduClassroomConfig.shared.sessionInfo.userName}
              <div>You can broadcast here</div>
            </div>
          </div>
          <BroadCastButtonGroup isBroadCasting={!!isBroadCasting} />
        </div>
      </div>
    </div>
  );
});

const BroadCastButtonGroup = ({ isBroadCasting }: { isBroadCasting: boolean }) => {
  const {
    streamUIStore: { updateLocalPublishState },
    classroomStore: {
      mediaStore: { enableLocalVideo, enableLocalAudio, cameraDeviceId, recordingDeviceId },
    },
  } = useStore();
  const [cameraOpen, setCameraOpen] = useState(
    !!(cameraDeviceId && cameraDeviceId !== DEVICE_DISABLE),
  );
  const [micOpen, setMicOpen] = useState(
    !!(recordingDeviceId && recordingDeviceId !== DEVICE_DISABLE),
  );

  const [showBroadCastOverlay, setShowBroadCastOverlay] = useState(false);

  const timer = useRef(-1);
  useEffect(() => {
    if (isBroadCasting) {
      if (cameraOpen) {
        unMuteVideo();
      } else {
        muteVideo();
      }
    } else {
      muteVideo();
    }
  }, [cameraOpen, isBroadCasting]);
  useEffect(() => {
    if (isBroadCasting) {
      if (micOpen) {
        unMuteAudio();
      } else {
        muteAudio();
      }
    } else {
      muteAudio();
    }
  }, [micOpen, isBroadCasting]);

  const muteVideo = () => {
    enableLocalVideo(false);
  };
  const unMuteVideo = () => {
    enableLocalVideo(true);
  };
  const muteAudio = () => {
    enableLocalAudio(false);
  };
  const unMuteAudio = () => {
    enableLocalAudio(true);
  };
  const startSpeak = () => {
    updateLocalPublishState({ audioState: 1, videoState: 1 });
  };
  const stopSpeak = () => {
    updateLocalPublishState({ audioState: 0, videoState: 0 });
  };
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
    <div className="fcr_proctor_sider_info_proctor-actions-btn">
      {
        <div className="fcr_proctor_sider_info_proctor-actions-speaker">
          <Button
            type="primary"
            onClick={isBroadCasting ? stopSpeak : startSpeak}
            danger={!!isBroadCasting}
            block>
            {isBroadCasting ? (
              <SvgImg type={SvgIconEnum.PHONE} size={36}></SvgImg>
            ) : (
              <>
                <SvgImg type={SvgIconEnum.BROADCAST} size={36} />
                {transI18n('fcr_room_button_broadcast')}
              </>
            )}
          </Button>
          <div
            onMouseEnter={showOverlay}
            onMouseLeave={closeOverlay}
            className="fcr_proctor_sider_info_proctor-actions-speaker-extra">
            <SvgImg type={SvgIconEnum.EXTRA_VERTICAL} />
          </div>

          <div
            onMouseEnter={showOverlay}
            onMouseLeave={closeOverlay}
            style={showBroadCastOverlay ? { maxHeight: '132px' } : { maxHeight: 0, padding: 0 }}
            className="fcr_proctor_sider_info_proctor-actions-speaker-overlay">
            <div>
              <div>
                <SvgImg
                  style={{ marginRight: '4px' }}
                  type={SvgIconEnum.CAMERA_ON}
                  size={24}
                  colors={{ iconPrimary: '#357BF6' }}></SvgImg>

                <span>{transI18n('fcr_exam_prep_label_camera')}</span>
              </div>

              <Switch
                checked={cameraOpen}
                checkedChildren={transI18n('fcr_device_test_label_enable')}
                unCheckedChildren={transI18n('fcr_device_test_label_disable')}
                size="small"
                onChange={(checked) => {
                  setCameraOpen(checked);
                }}></Switch>
            </div>
            <div>
              <div>
                <SvgImg
                  style={{ marginRight: '4px' }}
                  size={24}
                  type={SvgIconEnum.MICROPHONE_ON}
                  colors={{ iconPrimary: '#357BF6' }}></SvgImg>
                <span>{transI18n('fcr_exam_prep_label_microphone')}</span>
              </div>

              <Switch
                checked={micOpen}
                checkedChildren={transI18n('fcr_device_test_label_enable')}
                unCheckedChildren={transI18n('fcr_device_test_label_disable')}
                size="small"
                onChange={(checked) => {
                  setMicOpen(checked);
                }}></Switch>
            </div>
          </div>
        </div>
      }
    </div>
  );
};
