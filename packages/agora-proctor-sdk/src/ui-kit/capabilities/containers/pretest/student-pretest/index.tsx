import { AgoraStep, AgoraSteps } from "@/ui-kit/components/steps"
import { Col, Row } from 'antd';
import styled, { css } from "styled-components"

export const StudentPretest = () => {

    return (
        <Container>
            <PreTestHeader>Exam Prep</PreTestHeader>
            <AgoraSteps current={1} progressDot>
                <AgoraStep title="01" description="Device Test" />
                <AgoraStep title="02" description="Take your photo" />
                <AgoraStep title="03" description="Share entire screen" />
            </AgoraSteps>
            <ProcessInfo>Please 进行设备检测</ProcessInfo>
            <StyledRow>
                <Col span={12}>
                    <ItemTitle>Camera</ItemTitle>
                    <Card>
                        camera 1
                    </Card>
                </Col>
                <Col span={12}>
                    <ItemTitle>Microphone</ItemTitle>
                    <Card>
                        card 2
                    </Card>
                    <ItemTitle>Speaker</ItemTitle>
                    <Card>
                       card 3
                    </Card>
                </Col>
            </StyledRow>
        </Container>
    )
}


const CardRadius = css`
    border-radius: 24px;
`
const Container = styled.div`
    height: 663px;
    box-sizing: border-box;
`
const PreTestHeader = styled.p`
    font-weight: 800;
    font-size: 26px;
    line-height: 14px;
    text-align: center;
    margin-top: 36px;
`
const StyledRow = styled(Row)`
    padding: 0 29px;
`
const ProcessInfo = styled(PreTestHeader)`
    font-size: 18px;
    font-weight: 400;
    margin-top: 60px;
    margin-bottom: 40px;
`
const ItemTitle = styled(PreTestHeader)`
    text-align: left;
    font-size: 16px;
    margin-top: 0;
`

const Card = styled.div`
    ${CardRadius}
    background: rgb(51, 50, 68, 0.05);
    padding: 6px;
`