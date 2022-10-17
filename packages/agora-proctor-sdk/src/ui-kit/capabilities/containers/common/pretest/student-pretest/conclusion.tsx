import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { SvgIconEnum, SvgImg } from '~ui-kit';
import cameraImage from '../assets/camera.png';
import microphoneImage from '../assets/microphone.png';
import photoImage from '../assets/photo.png';
import screenShareImage from '../assets/screen-share.png';

const STEPS = [
  { text: 'webCam', image: cameraImage },
  { text: 'Microphone', image: microphoneImage },
  { text: 'Photo', image: photoImage },
  { text: 'Screen Share', image: screenShareImage },
];

export const Conclusion = observer(() => {
  const {
    pretestUIStore: { stepupStates },
  } = useStore();
  return (
    <Container>
      {STEPS.map((step, index) => (
        <Item key={step.text}>
          <ItemImg src={step.image} width="80px" height="80px" alt={step.text} />
          <ItemText>
            {stepupStates[index] ? (
              <SvgImg type={SvgIconEnum.TICK} colors={{ iconPrimary: '#000' }} size={20}></SvgImg>
            ) : (
              <SvgImg type={SvgIconEnum.CLOSE} colors={{ iconPrimary: '#000' }} size={20}></SvgImg>
            )}
            <span>{step.text}</span>
          </ItemText>
        </Item>
      ))}
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Item = styled.div`
  width: 129px;
  height: 169px;
  border-radius: 16px;
  background: #454466;
`;

const ItemImg = styled.img`
  margin: 0 auto;
  margin-top: 19px;
  margin-bottom: 10px;
`;

const ItemText = styled.div`
  text-align: center;
  height: 60px;
  line-height: 60px;
  border-radius: 16px;
  border: 1px solid #dbdfec;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;
