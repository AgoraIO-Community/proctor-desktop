import { useStore } from '@/infra/hooks/ui-store';
import { isProduction } from '@/infra/utils/env';
import { AgoraButton } from '@/ui-kit/components/button';
import { AgoraMidBorderRadius, FlexCenterDiv } from '@/ui-kit/components/common';
import { AgoraSelect } from '@/ui-kit/components/select';
import { Volume } from '@/ui-kit/components/volume';
import { EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { Col, Row } from 'antd';
import { observer } from 'mobx-react';
import { FC, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import PretestAudio from './assets/pretest-audio.mp3';

const { Option } = AgoraSelect;
export const PreTestCamera: FC = observer(() => {
  const {
    pretestUIStore: { cameraDevicesList, currentCameraDeviceId, setCameraDevice },
  } = useStore();

  const handleCameraChange = useCallback((value) => {
    setCameraDevice(value);
  }, []);

  return (
    <AgoraSelect
      style={{ width: '100%' }}
      value={currentCameraDeviceId}
      onChange={handleCameraChange}
      suffixIcon={<SvgImg type={SvgIconEnum.DROPDOWN} colors={{ iconPrimary: '#000' }}></SvgImg>}>
      {cameraDevicesList.map((device) => (
        <Option value={device.value} key={device.value}>
          {device.label}
        </Option>
      ))}
    </AgoraSelect>
  );
});

export const PreTestMicrophone: FC = observer(() => {
  const {
    pretestUIStore: { recordingDevicesList, currentRecordingDeviceId, setRecordingDevice },
  } = useStore();
  const handleMicrophoneChange = useCallback((value) => {
    setRecordingDevice(value);
  }, []);
  return (
    <div style={{ paddingBottom: '20px' }}>
      <AgoraSelect
        style={{ width: '100%' }}
        value={currentRecordingDeviceId}
        onChange={handleMicrophoneChange}
        suffixIcon={<SvgImg type={SvgIconEnum.DROPDOWN} colors={{ iconPrimary: '#000' }}></SvgImg>}>
        {recordingDevicesList.map((device) => (
          <Option value={device.value} key={device.value}>
            {device.label}
          </Option>
        ))}
      </AgoraSelect>
      <VolumeDance />
    </div>
  );
});

export const PreTestSpeaker: FC = observer(() => {
  const {
    pretestUIStore: {
      playbackDevicesList,
      currentPlaybackDeviceId,
      setPlaybackDevice,
      startPlaybackDeviceTest,
      stopPlaybackDeviceTest,
    },
  } = useStore();

  const urlRef = useRef<string>(PretestAudio);
  const handlePlaybackChange = useCallback((value) => {
    setPlaybackDevice(value);
  }, []);

  useEffect(() => {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      const path = window.require('path');
      urlRef.current = isProduction
        ? `${window.process.resourcesPath}/pretest-audio.mp3`
        : path.resolve('./assets/pretest-audio.mp3');
    }
    return stopPlaybackDeviceTest;
  }, []);

  return (
    <Row gutter={6}>
      <Col span={16}>
        <AgoraSelect
          style={{ width: '100%' }}
          value={currentPlaybackDeviceId}
          onChange={handlePlaybackChange}
          suffixIcon={
            <SvgImg type={SvgIconEnum.DROPDOWN} colors={{ iconPrimary: '#000' }}></SvgImg>
          }>
          {playbackDevicesList.map((device) => (
            <Option value={device.value} key={device.value}>
              {device.label}
            </Option>
          ))}
        </AgoraSelect>
      </Col>
      <Col span={8}>
        <AgoraButton
          type="primary"
          subType="black"
          size="large"
          style={{ width: '100%', borderRadius: '12px', paddingLeft: '15px', paddingRight: '15px' }}
          onClick={(_) => startPlaybackDeviceTest(urlRef.current)}>
          <FlexCenterDiv>
            <SvgImg type={SvgIconEnum.SPEAKER} size={30}></SvgImg>
            <span>{transI18n('fcr_exam_prep_button_test')}</span>
          </FlexCenterDiv>
        </AgoraButton>
      </Col>
    </Row>
  );
});

export const PureVideo: FC<{ height?: string }> = observer((props) => {
  const {
    pretestUIStore: { setupLocalVideo },
  } = useStore();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setupLocalVideo(ref.current, false);
    }
  }, [ref]);

  return <VideoContainer ref={ref} height={props.height} />;
});

const VolumeDance: FC = observer(() => {
  const {
    pretestUIStore: { localVolume },
  } = useStore();

  return (
    <VolumeDanceContainer>
      <Row>
        <Col span={2}>
          <SvgImg type={SvgIconEnum.MICROPHONE_ON} />
        </Col>
        <Col span={22}>
          <Volume cursor={localVolume} peek={100} />
        </Col>
      </Row>
    </VolumeDanceContainer>
  );
});

const VideoContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${(props) => (props.height ? props.height : '175px')};
  ${AgoraMidBorderRadius}
  overflow: hidden;
  margin-top: 8px;
`;

const VolumeDanceContainer = styled.div`
  margin-top: 11px;
`;
