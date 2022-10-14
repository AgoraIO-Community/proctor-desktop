import { useStore } from '@/infra/hooks/ui-store';
import { AgoraButton } from '@/ui-kit/components/button';
import { AgoraMidBorderRadius } from '@/ui-kit/components/common';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { transI18n } from '~ui-kit';
import { PureVideo } from '../media-info';

export const ImageSnapshot = observer(() => {
  const {
    pretestUIStore: { snapshotImage, getSnapshotImage },
  } = useStore();

  return (
    <Container>
      <PureVideo height="217px" />
      <Actions align={snapshotImage ? 'space-between' : 'center'}>
        {snapshotImage && <SnapshotImage image={snapshotImage} />}
        <AgoraButton type="primary" subType="black" size="large" onClick={getSnapshotImage}>
          {snapshotImage
            ? transI18n('fcr_exam_prep_button_retake')
            : transI18n('fcr_exam_prep_button_take_photo')}
        </AgoraButton>
      </Actions>
    </Container>
  );
});

const Container = styled.div`
  width: 381px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const Actions = styled.div<{ align: 'center' | 'space-between' }>`
  height: 93px;
  width: 100%;
  margin-top: 12px;
  padding: 0 12px;
  display: flex;
  justify-content: ${(props) => props.align};
  align-items: center;
  background: ${(props) =>
    props.align === 'space-between' ? 'rgba(51, 50, 68, 0.05)' : 'transparent'};
  ${AgoraMidBorderRadius}
`;
const SnapshotImage = styled.div<{ image: string | undefined }>`
  width: 120px;
  height: 69px;
  background-image: url(${(props) => (props.image ? props.image : '')});
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  transform: rotateY(180deg);
  ${AgoraMidBorderRadius};
`;
