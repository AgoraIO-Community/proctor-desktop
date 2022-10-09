import { useStore } from "@/infra/hooks/ui-store";
import { FlexContainer } from "@/ui-kit/components/container";
import { Counter } from "@/ui-kit/components/counter";
import { observer } from "mobx-react";
import { useCallback } from "react";
import styled, { css } from "styled-components";
import { transI18n } from "~ui-kit";
import { TrackArea } from "../../common/root-box";
import { WidgetContainer } from "../../common/widget";

export const Content = observer(() => {
  const {
    studentViewUIStore: { widgetBlur },
  } = useStore();
  return (
    <FlexContainer direction="column" gap={13} flex={1}>
      <ScenarioHeader>
        <img src={require("../../common/logo.png")} width={146} />
      </ScenarioHeader>
      <FlexContainer flex={1}>
        <InitialPanel>
          <ContentProspect />
          <TrackArea top={0} boundaryName="classroom-track-bounds" />
          <WidgetExamContainer blur={widgetBlur}>
            <WidgetContainer />
          </WidgetExamContainer>
        </InitialPanel>
      </FlexContainer>
    </FlexContainer>
  );
});

const ContentProspect = observer(() => {
  const {
    studentViewUIStore: { counterOpening, beforeClass },
  } = useStore();

  const handleFinished = useCallback(() => {
    console.log("finished");
  }, []);
  return (
    <>
      {beforeClass && (
        <>
          <img src={require("../../common/waiting.png")} width={256} />
          {transI18n("fcr_room_label_wait_teacher_start_exam")}
        </>
      )}
      {counterOpening && <Counter onFinished={handleFinished} />}
    </>
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
const WidgetExamContainer = styled.div<{ blur?: boolean }>`
  ${(props) =>
    props.blur &&
    css`
      filter: blur(14px);
    `}
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  & .react-draggable {
    width: 100% !important;
    height: 100% !important;
  }
`;