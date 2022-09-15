import styled from "styled-components";

interface IViewProps {
  tag: "PC" | "Phone";
  video: React.ReactNode;
}
export const SupervisorView: React.FC<IViewProps> = ({ tag, video }) => {
  return (
    <Container>
      <Tag>
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
  width: 49px;
  height: 17px;
  display: flex;
  position: absolute;
  bottom: 6px;
  left: 6px;
  border-radius: 8px;
  background: rgba(217, 217, 217, 0.9);
  align-items: center;
  justify-content: space-between;
`;

const TagText = styled.span`
  font-size: 16px;
  transform: scale(0.5);
  color: #000;
`;
