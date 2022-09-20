import styled from "styled-components";
import { SvgIconEnum, SvgImg } from "~ui-kit";

interface IViewProps {
  tag: "Phone" | "PC";
  video: React.ReactNode;
}
export const SupervisorView: React.FC<IViewProps> = ({ tag, video }) => {
  return (
    <Container>
      <Tag>
        <SvgImg
          type={SvgIconEnum.RECORDING}
          size={16}
          colors={{ iconPrimary: "#000" }}
          style={{ flex: "1 0 16px" }}
        />
        <TagText>{tag}</TagText>
      </Tag>
      {video}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
const Tag = styled.div`
  width: 54px;
  height: 17px;
  padding: 0 4px;
  display: flex;
  position: absolute;
  bottom: 6px;
  left: 6px;
  border-radius: 8px;
  background: rgba(217, 217, 217, 0.9);
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const TagText = styled.span`
  font-size: 16px;
  transform: scale(0.5);
  transform-origin: left;
  color: #000;
`;
