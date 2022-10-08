import { useStore } from "@/infra/hooks/ui-store";
import { AgoraStep, AgoraSteps } from "@/ui-kit/components/steps";
import { observer } from "mobx-react";
import styled from "styled-components";
import { transI18n } from "~ui-kit";
import { Conclusion } from "./conclusion";
import { DeviceTest } from "./device-test";
import { ImageSnapshot } from "./image-snapshot";
import { ShareScreen } from "./share-screen";

export const StudentPretest = observer(() => {
  const {
    pretestUIStore: { currentStep, headerStep },
  } = useStore();

  return (
    <Container>
      <PreTestHeader>
        {transI18n("fcr_home_page_scene_option_online_proctoring")}
      </PreTestHeader>
      <AgoraSteps current={headerStep} progressDot>
        <AgoraStep
          title="01"
          description={transI18n("fcr_exam_prep_label_device_test")}
        />
        <AgoraStep
          title="02"
          description={transI18n("fcr_exam_prep_label_take_photo")}
        />
        <AgoraStep
          title="03"
          description={transI18n("fcr_exam_prep_label_share_screen")}
        />
      </AgoraSteps>
      <ProcessInfo>
        {" "}
        {transI18n("fcr_exam_prep_label_test_exam_device")}
      </ProcessInfo>
      {currentStep === 0 && <DeviceTest />}
      {currentStep === 1 && <ImageSnapshot />}
      {currentStep === 2 && <ShareScreen />}
      {currentStep === 3 && <Conclusion />}
    </Container>
  );
});
export const TeacherPretest = observer(() => {
  return (
    <Container>
      <PreTestHeader>
        {transI18n("fcr_home_page_scene_option_online_proctoring")}
      </PreTestHeader>
      <ProcessInfo>
        {transI18n("fcr_exam_prep_label_test_exam_device")}
      </ProcessInfo>
      <DeviceTest />
    </Container>
  );
});
const Container = styled.div`
  height: 556px;
  box-sizing: border-box;
`;
const PreTestHeader = styled.p`
  font-weight: 800;
  font-size: 26px;
  line-height: 14px;
  text-align: center;
  padding-top: 36px;
`;

const ProcessInfo = styled(PreTestHeader)`
  font-size: 18px;
  font-weight: 400;
  padding: 30px 0;
  margin-bottom: 0;
`;
