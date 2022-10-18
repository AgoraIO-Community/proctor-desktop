import { SvgIconEnum, SvgImg } from '~ui-kit';
import styled from 'styled-components';
export const Tag = ({ svgIcon, tagText }: { svgIcon: SvgIconEnum; tagText: string }) => {
  return (
    <TagContainer>
      <SvgImg
        type={svgIcon}
        size={16}
        colors={{ iconPrimary: '#000' }}
        style={{ flex: '1 0 16px' }}
      />
      <TagText>{tagText}</TagText>
    </TagContainer>
  );
};
const TagContainer = styled.div`
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
  z-index: 9;
`;

const TagText = styled.span`
  font-size: 16px;
  transform: scale(0.5);
  transform-origin: left;
  color: #000;
`;
