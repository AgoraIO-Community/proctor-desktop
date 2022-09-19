import { AgoraButton } from "@/ui-kit/components/button";
import { AgoraBaseTextColor } from "@/ui-kit/components/common";
import styled from "styled-components";

export const RoomOperation = () => {
  return (
    <OperationContainer>
      <RoomTimer />
      <ExistBtn />
      <ExistClose />
    </OperationContainer>
  );
};

const RoomTimer = () => {
  return (
    <div>
      <TimerTip>Start Time</TimerTip>
      <Timer>08: 30</Timer>
    </div>
  );
};

const ExistBtn = () => {
  return (
    <AgoraButton type="primary" subType="red" shape="round">
      exist
    </AgoraButton>
  );
};

const ExistClose = () => {
  return <CloseBtn>x</CloseBtn>;
};

const OperationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TimerTip = styled.div`
  color: #bdbec6;
  font-size: 10px;
`;
const Timer = styled.div`
  font-size: 17px;
  color: ${AgoraBaseTextColor};
`;
const CloseBtn = styled.span`
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  line-height: 40px;
  text-align: center;
  font-size: 18px;
  font-weight: 200;
  background: rgba(138, 138, 138, 0.1);
  opacity: 0.8;
  cursor: pointer;
`;
