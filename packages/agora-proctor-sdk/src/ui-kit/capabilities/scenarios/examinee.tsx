import { FlexContainer } from "@/ui-kit/components/container";
import { Content } from "../containers/content";
import { Sider } from "../containers/sider";
import Room from "./room";

export const ExamineeScenario = () => {
  return (
    <Room>
      <FlexContainer>
        <Content />
        <Sider />
      </FlexContainer>
    </Room>
  );
};
