import { DialogContainer } from '../containers/common/dialog';
import { ProctorContainer } from '../containers/proctor/proctor-container';
import { ProctorContent } from '../containers/proctor/proctor-content';
import { ProctorSider } from '../containers/proctor/proctor-sider';
import Room from './room';

export const ProctorScenario = () => {
  return (
    <Room>
      <ProctorContainer>
        <>
          <ProctorSider></ProctorSider>
          <ProctorContent></ProctorContent>
        </>
      </ProctorContainer>
      <DialogContainer></DialogContainer>
    </Room>
  );
};
