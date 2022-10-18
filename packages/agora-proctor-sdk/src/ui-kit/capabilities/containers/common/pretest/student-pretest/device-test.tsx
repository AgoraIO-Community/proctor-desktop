import { AgoraMidBorderRadius, AgoraLargeBorderRadius } from '@/ui-kit/components/common';
import { Col, Row, Space } from 'antd';
import styled from 'styled-components';
import { transI18n } from '~ui-kit';
import { PreTestCamera, PreTestMicrophone, PreTestSpeaker, PureVideo } from '../media-info';

export const DeviceTest = () => {
  return (
    <HeaderRow gutter={22}>
      <Col span={12}>
        <ItemTitle>{transI18n('fcr_exam_prep_label_camera')}</ItemTitle>
        <Card>
          <PreTestCamera />
          <PureVideo />
        </Card>
      </Col>
      <Col span={12}>
        <Space size={24} direction="vertical" style={{ width: '100%' }}>
          <div>
            <ItemTitle>{transI18n('fcr_exam_prep_label_microphone')}</ItemTitle>
            <Card>
              <PreTestMicrophone />
            </Card>
          </div>
          <div>
            <ItemTitle marginTop="20px">{transI18n('fcr_exam_prep_label_speaker')}</ItemTitle>
            <Card>
              <PreTestSpeaker />
            </Card>
          </div>
        </Space>
      </Col>
    </HeaderRow>
  );
};
const HeaderRow = styled(Row)``;
const PreTestHeader = styled.p`
  font-weight: 800;
  font-size: 26px;
  line-height: 14px;
  text-align: center;
  margin-top: 36px;
`;
const ItemTitle = styled(PreTestHeader)<{ marginTop?: string }>`
  text-align: left;
  font-size: 16px;
  margin-bottom: 8px;
  margin-top: ${(props: any) => (props.marginTop ? props.marginTop : '8px')};
`;

const Card = styled.div`
  ${AgoraLargeBorderRadius}
  background: rgb(51, 50, 68, 0.05);
  padding: 6px;
`;
