import { useStore } from "@/infra/hooks/ui-store";
import { AgoraButton } from "@/ui-kit/components/button";
import { FlexContainer } from "@/ui-kit/components/container";
import { observer } from "mobx-react";
import styled from "styled-components";
import { transI18n } from "~ui-kit";
import { TrackArea } from "../root-box";
import { WidgetContainer } from "../widget";

export const Content = observer(() => {
  const {
    studentViewUIStore: { openWebview, testToast },
  } = useStore();
  return (
    <FlexContainer direction="column" gap={13} flex={1}>
      <ScenarioHeader>
        <img src={require("./logo.png")} width={146} />
      </ScenarioHeader>
      <FlexContainer flex={1}>
        <InitialPanel>
          <>
            <img src={require("./waiting.png")} width={256} />
            {transI18n("fcr_room_label_wait_teacher_start_exam")}
            <AgoraButton type="primary" onClick={openWebview}>
              开启webview
            </AgoraButton>
            <AgoraButton type="primary" subType="red" onClick={testToast}>
              toast student
            </AgoraButton>
          </>
          {/* <Counter /> */}
          <TrackArea top={0} boundaryName="classroom-track-bounds" />
          <WidgetContainer />
        </InitialPanel>
      </FlexContainer>
    </FlexContainer>
  );
});

const ScenarioHeader = styled.div`
  padding-left: 28px;
  padding-top: 28px;
`;

const InitialPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #000;

  width: 100%;
  height: 100%;
  font-size: 20px;
  position: relative;
`;
