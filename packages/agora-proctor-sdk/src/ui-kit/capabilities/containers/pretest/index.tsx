import { useStore } from "@/infra/hooks/ui-store";
import { AgoraButton } from "@/ui-kit/components/button";
import { AgoraModal } from "@/ui-kit/components/modal";
import { EduClassroomConfig, EduRoleTypeEnum } from "agora-edu-core";
import { observer } from "mobx-react";
import { FC } from "react";
import styled from "styled-components";
import { StudentPretest, TeacherPretest } from "./student-pretest";

interface pretestProps {
  onOk: () => void;
}
export const PretestContainer: FC<pretestProps> = observer(({ onOk }) => {
  const isTeacher =
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher;
  return isTeacher ? (
    <TeacherPretestModal onOk={onOk}></TeacherPretestModal>
  ) : (
    <StudentPretestModal onOk={onOk}></StudentPretestModal>
  );
});

const StudentPretestModal: FC<pretestProps> = observer(({ onOk }) => {
  return (
    <AgoraModal
      centered
      open={true}
      width={730}
      footer={<StudentPretestFooter onOk={onOk} />}
      placement="bottom"
    >
      <StudentPretest />
    </AgoraModal>
  );
});
const TeacherPretestModal: FC<pretestProps> = observer(({ onOk }) => {
  return (
    <AgoraModal
      centered
      open={true}
      width={730}
      footer={<TeacherPretestFooter onOk={onOk} />}
      placement="bottom"
    >
      <TeacherPretest />
    </AgoraModal>
  );
});
const StudentPretestFooter: FC<pretestProps> = observer(({ onOk }) => {
  const {
    pretestUIStore: {
      setNextStep,
      currentStep,
      handleLeftBtnAction,
      rightBtnDisable,
      rightBtnText,
    },
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
      <AgoraButton
        size="large"
        type="primary"
        onClick={() => setNextStep(onOk)}
        disabled={rightBtnDisable}
        width="200px"
      >
        {rightBtnText}
      </AgoraButton>
    </FooterContainer>
  );
});
const TeacherPretestFooter: FC<pretestProps> = observer(({ onOk }) => {
  const {
    pretestUIStore: { rightBtnText },
  } = useStore();

  return (
    <FooterContainer>
      <AgoraButton size="large" type="primary" onClick={onOk} width="200px">
        {rightBtnText}
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
