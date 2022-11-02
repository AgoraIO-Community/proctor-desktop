import { AgoraCard } from '@/ui-kit/components/card';
import { AgoraBaseTextColor } from '@/ui-kit/components/common';
import { FlexContainer } from '@/ui-kit/components/container';
import { EduClassroomConfig } from 'agora-edu-core';
import { Space } from 'antd';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { transI18n } from '~ui-kit';
import { InteractiveVideo } from './interactive-video';
import { MainCameraView } from './main-camera-view';
import { RoomOperation } from './room-operation';
import { SubCameraView } from './sub-camera-view';

export const Sider = observer(() => {
  return (
    <FlexContainer width={247} direction="column" gap={12} style={{ padding: '12px' }}>
      <AgoraCard background="linear-gradient(180deg, #F2F3F7 0%, #EAEAEA 100%)">
        <SiderSpace size={17} direction="vertical">
          <HelloHeader>
            {transI18n('fcr_device_test_label_hello')},
            {EduClassroomConfig.shared.sessionInfo.userName}
          </HelloHeader>
          <RoomOperation />
          <InteractiveVideo />
        </SiderSpace>
      </AgoraCard>
      <MainCameraView />
      <SubCameraView />
    </FlexContainer>
  );
});

const SiderSpace = styled(Space)`
  padding: 16px 0 16px 16px;
  width: 100%;
`;

const HelloHeader = styled.div.attrs((props) => ({
  title: EduClassroomConfig.shared.sessionInfo.userName,
}))`
  font-weight: 400;
  font-size: 30px;
  color: ${AgoraBaseTextColor};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
