import { useStore } from "@/infra/hooks/ui-store";
import { AgoraButton } from "@/ui-kit/components/button";
import { FlexContainer } from "@/ui-kit/components/container";
import { AgoraModal } from "@/ui-kit/components/modal";
import {
  AgoraEduClassroomEvent,
  EduEventCenter,
  LeaveReason,
} from "agora-edu-core";
import { observer } from "mobx-react";
import { useCallback } from "react";
import styled from "styled-components";
import { Content } from "../containers/content";
import { Sider } from "../containers/sider";
import Room from "./room";

export const ExamineeScenario = observer(() => {
  return (
    <Room>
      <FlexContainer>
        <Content />
        <Sider />
      </FlexContainer>
      <RoomCloseModal />
    </Room>
  );
});

const RoomCloseModal = observer(() => {
  const {
    studentViewUIStore: { roomClose, userAvatar },
  } = useStore();
  return true ? (
    <AgoraModal
      centered
      open={true}
      width={730}
      placement="bottom"
      footer={<LeaveRoomFooter />}
    >
      <Title>The Exam is Over!</Title>
      <section style={{ padding: "0 70px 103px 70px" }}>
        <FlexContainer direction="row" gap={20}>
          <FlexContainer direction="column" gap={28}>
            <section>
              <BolderTitle>Hello Alice</BolderTitle>
            </section>
            <DescriptionTip>
              The exam is over. Hope you can get a good result!
            </DescriptionTip>
          </FlexContainer>
          <Avatar image={userAvatar} />
        </FlexContainer>
        <Description>
          You can exit the computer and mobile examination room
        </Description>
      </section>
    </AgoraModal>
  ) : null;
});

const LeaveRoomFooter = observer(() => {
  const handleLeaveRoom = useCallback(() => {
    //leave room
    EduEventCenter.shared.emitClasroomEvents(
      AgoraEduClassroomEvent.Destroyed,
      LeaveReason.leave
    );
  }, []);
  return (
    <FooterContainer>
      <AgoraButton
        type="primary"
        size="large"
        width="200px"
        onClick={handleLeaveRoom}
      >
        I get it
      </AgoraButton>
    </FooterContainer>
  );
});

const Title = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #000;
  text-align: center;
  padding-top: 40px;
  padding-bottom: 80px;
`;
const BolderTitle = styled(Title)`
  text-align: left;
  padding: 0;
`;
const Description = styled.div`
  margin-top: 56px;
  font-weight: 400;
  font-size: 18px;
  color: #000;
`;
const DescriptionTip = styled(Description)`
  margin: 0;
  font-weight: 500;
  font-size: 20px;
`;

const Avatar = styled.div<{ image?: string }>`
  width: 193px;
  height: 135px;
  flex: 1 0 193px;
  border-radius: 16px;
  background-image: url(${(props) => props.image});
`;
const FooterContainer = styled.div`
  text-align: center;
  height: 100%;
  line-height: 100px;
`;
