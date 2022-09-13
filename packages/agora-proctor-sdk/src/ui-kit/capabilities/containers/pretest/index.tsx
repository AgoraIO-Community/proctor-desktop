import { useStore } from "@/infra/hooks/ui-store";
import { AgoraButton } from "@/ui-kit/components/button";
import { AgoraModal } from "@/ui-kit/components/modal";
import { observer } from "mobx-react";
import styled from "styled-components";
import { StudentPretest } from "./student-pretest";

export const PretestContainer = observer(() => {
  return (
    <AgoraModal
      centered
      open={true}
      width={730}
      footer={<PretestFooter />}
      placement="bottom"
    >
      <StudentPretest />
    </AgoraModal>
  );
});

const PretestFooter = observer(() => {
  const {
    pretestUIStore: { setNextStep, currentStep, handleLeftBtnAction },
  } = useStore();

  return (
    <FooterContainer>
      <AgoraButton
        size="large"
        type="primary"
        subType="original"
        onClick={handleLeftBtnAction}
      >
        {currentStep <= 0 ? "cancel" : "prev"}
      </AgoraButton>
      <AgoraButton size="large" type="primary" onClick={() => setNextStep()}>
        next
      </AgoraButton>
    </FooterContainer>
  );
});

const FooterContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
`;
