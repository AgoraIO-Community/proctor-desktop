import { useStore } from '@/infra/hooks/ui-store';
import { AgoraLargeBorderRadius, AgoraMidBorderRadius } from '@/ui-kit/components/common';
import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

export const ShareScreen = observer(() => {
  const {
    pretestUIStore: { isScreenSharing, setupLocalScreenShare, startLocalScreenShare },
  } = useStore();

  const shareRef = useRef<HTMLDivElement | null>();

  useEffect(() => {
    !isScreenSharing && startLocalScreenShare();
  }, [isScreenSharing]);

  useEffect(() => {
    isScreenSharing && setupLocalScreenShare(shareRef.current as HTMLDivElement);
  }, [isScreenSharing, setupLocalScreenShare]);

  return (
    <Container>
      <ScreenTrackPlayer
        ref={(ins) => {
          shareRef.current = ins;
        }}></ScreenTrackPlayer>
      <span>Screen</span>
    </Container>
  );
});
const ScreenTrackPlayer = styled.div`
  width: 278px;
  height: 155px;
  margin: 0 auto;
  background: #d9d9d9;
  border-radius: 16px;
  overflow: hidden;
`;
const Container = styled.div`
  width: 290px;
  height: 216px;
  margin: 0 auto;
  border: 2px solid #357bf6;
  background: #fff;
  color: #000;
  font-size: 14px;
  overflow: hidden;
  padding-top: 4px;
  text-align: center;
  ${AgoraLargeBorderRadius};
  > span {
    line-height: 55px;
  }
`;
