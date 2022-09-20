import { FlexContainer } from "@/ui-kit/components/container";
import styled from "styled-components";

export const Content = () => {
  return (
    <FlexContainer direction="column" gap={13} flex={1}>
      <ScenarioHeader>
        <img src={require("./logo.png")} width={146} />
      </ScenarioHeader>
      <FlexContainer flex={1}>
        <InitialPanel>
          <>
            <img src={require("./waiting.png")} width={256} />
            Please Wait Until the Proctor Starts the Exam.
          </>
          {/* <Counter /> */}
        </InitialPanel>
      </FlexContainer>
    </FlexContainer>
  );
};

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
`;
