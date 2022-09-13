import { useStore } from "@/infra/hooks/ui-store";
import { AgoraMidBorderRadius } from "@/ui-kit/components/common";
import { observer } from "mobx-react";
import { useEffect, useRef } from "react";
import styled from "styled-components";

export const ShareScreen = observer(() => {
  const {
    pretestUIStore: {
      isScreenSharing,
      setupLocalScreenShare,
      startLocalScreenShare,
    },
  } = useStore();

  const shareRef = useRef<HTMLDivElement | null>();

  useEffect(() => {
    !isScreenSharing && startLocalScreenShare();
  }, [isScreenSharing]);

  useEffect(() => {
    isScreenSharing &&
      setupLocalScreenShare(shareRef.current as HTMLDivElement);
  }, [isScreenSharing, setupLocalScreenShare]);

  return (
    <Container
      ref={(ins) => {
        shareRef.current = ins;
      }}
    ></Container>
  );
});

const Container = styled.div`
  width: 290px;
  height: 216px;
  margin: 0 auto;
  border: 2px solid #357bf6;
  background: #fff;
  color: #000;
  font-size: 14px;
  overflow: hidden;
  ${AgoraMidBorderRadius};
`;
