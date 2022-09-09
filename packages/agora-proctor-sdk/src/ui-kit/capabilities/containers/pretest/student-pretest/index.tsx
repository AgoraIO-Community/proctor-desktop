import { AgoraMidBorderRadius } from "@/ui-kit/components/common";
import { AgoraStep, AgoraSteps } from "@/ui-kit/components/steps";
import { Col, Row } from "antd";
import { observer } from "mobx-react";
import styled from "styled-components";
import {
  PreTestCamera,
  PreTestMicrophone,
  PreTestSpeaker,
  PureVideo,
} from "../media-info";

export const StudentPretest = observer(() => {
  return (
    <Container>
      <PreTestHeader>Exam Prep</PreTestHeader>
      <AgoraSteps current={1} progressDot>
        <AgoraStep title="01" description="Device Test" />
        <AgoraStep title="02" description="Take your photo" />
        <AgoraStep title="03" description="Share entire screen" />
      </AgoraSteps>
      <ProcessInfo>Please 进行设备检测</ProcessInfo>
      <HeaderRow gutter={22}>
        <Col span={12}>
          <ItemTitle>Camera</ItemTitle>
          <Card>
            <PreTestCamera />
            <PureVideo />
          </Card>
        </Col>
        <Col span={12}>
          <ItemTitle>Microphone</ItemTitle>
          <Card>
            <PreTestMicrophone />
          </Card>
          <ItemTitle marginTop="20px">Speaker</ItemTitle>
          <Card>
            <PreTestSpeaker />
          </Card>
        </Col>
      </HeaderRow>
    </Container>
  );
});

const Container = styled.div`
  height: 663px;
  box-sizing: border-box;
`;
const PreTestHeader = styled.p`
  font-weight: 800;
  font-size: 26px;
  line-height: 14px;
  text-align: center;
  margin-top: 36px;
`;
const HeaderRow = styled(Row)`
  padding: 0 29px;
`;
const ProcessInfo = styled(PreTestHeader)`
  font-size: 18px;
  font-weight: 400;
  margin-top: 60px;
  margin-bottom: 40px;
`;
const ItemTitle = styled(PreTestHeader)<{ marginTop?: string }>`
  text-align: left;
  font-size: 16px;
  margin-bottom: 8px;
  margin-top: ${(props: any) => (props.marginTop ? props.marginTop : "8px")};
`;

const Card = styled.div`
  ${AgoraMidBorderRadius}
  background: rgb(51, 50, 68, 0.05);
  padding: 6px;
`;
