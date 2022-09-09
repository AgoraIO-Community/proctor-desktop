import { AgoraButton } from "@/ui-kit/components/button";
import { AgoraModal } from "@/ui-kit/components/modal";
import { observer } from "mobx-react";
import styled from "styled-components";
import { StudentPretest } from "./student-pretest";

export const PretestContainer = observer(() => {
  return (
    <AgoraModal centered open={true} width={731} footer={<PretestFooter />}>
      <StudentPretest />
    </AgoraModal>
  );
});

const PretestFooter = observer(() => {
  return (
    <FooterContainer>
      <AgoraButton size="large" type="primary" subType="original">
        prev
      </AgoraButton>
      <AgoraButton size="large" type="primary">
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
