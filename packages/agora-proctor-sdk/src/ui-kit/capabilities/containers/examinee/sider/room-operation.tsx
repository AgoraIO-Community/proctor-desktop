import { useStore } from '@/infra/hooks/ui-store';
import { AgoraButton } from '@/ui-kit/components/button';
import { AgoraBaseTextColor } from '@/ui-kit/components/common';
import { observer } from 'mobx-react';
import { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';

const RoomTimer = observer(() => {
  const {
    roomUIStore: { classStatusText, statusTextTip },
  } = useStore();
  return (
    <div>
      <TimerTip>{statusTextTip}</TimerTip>
      <Timer>{classStatusText}</Timer>
    </div>
  );
});
const ExistBtn = observer(({ onFold }: { onFold: (fold: boolean) => void }) => {
  const {
    studentViewUIStore: { leaveMainClassroom },
    roomUIStore: { leaveClassroom, currentGroupUuid },
  } = useStore();

  const handleExitRoom = useCallback(async () => {
    await leaveClassroom(currentGroupUuid!);
    await leaveMainClassroom();
  }, []);
  return (
    <BtnWithCloseCheck
      foldBtn={
        <AgoraButton size="middle" type="primary" subType="red" shape="round">
          <SvgImg type={SvgIconEnum.QUIT} />
          {transI18n('fcr_room_button_leave')}
        </AgoraButton>
      }
      unFoldBtn={
        <AgoraButton size="middle" type="primary" subType="red" shape="round">
          <SvgImg type={SvgIconEnum.QUIT} />
          {transI18n('fcr_room_button_leave')}
        </AgoraButton>
      }
      onClick={handleExitRoom}
      onFold={onFold}></BtnWithCloseCheck>
  );
});
export const BtnWithCloseCheck = observer(
  ({
    onClick,
    onFold,
    foldBtn,
    unFoldBtn,
  }: {
    onClick: () => void;
    onFold?: (fold: boolean) => void;
    foldBtn: JSX.Element;
    unFoldBtn: JSX.Element;
  }) => {
    const [fold, setFold] = useState(true);
    useEffect(() => {
      onFold && onFold(fold);
    }, [fold]);
    const handleExitClick = () => {
      if (fold) {
        setFold(false);
      } else {
        onClick();
      }
    };
    return (
      <>
        <div onClick={handleExitClick}>{fold ? foldBtn : unFoldBtn}</div>

        {!fold && (
          <CloseBtn
            onClick={() => {
              setFold(true);
            }}>
            <SvgImg type={SvgIconEnum.CLOSE}></SvgImg>
          </CloseBtn>
        )}
      </>
    );
  },
);

export const RoomOperation = observer(() => {
  const [fold, setFold] = useState(true);
  return (
    <OperationContainer>
      {fold && <RoomTimer />}
      <ExistBtn onFold={setFold} />
    </OperationContainer>
  );
});

const OperationContainer = styled.div`
  padding-right: 15px;
  height: 40px;
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
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 15px;
  background: #8a8a8a1a;
  line-height: 40px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
`;
