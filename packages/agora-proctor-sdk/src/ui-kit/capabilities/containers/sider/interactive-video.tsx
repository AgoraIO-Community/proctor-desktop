import { Space } from "antd";
import styled, { css } from "styled-components";

export const InteractiveVideo = () => {
  return (
    <Space direction="vertical" size={15}>
      <StudentPhoto scale={0.5} />
      <TeacherVideo />
    </Space>
  );
};

const videoWidth = 193,
  videoHeight = 135;

const siderVideoBox = css`
  width: ${videoWidth}px;
  height: ${videoHeight}px;
  border-radius: 16px;
  background: tomato;
`;

const StudentPhoto = styled.div<{ scale?: number; backgroundImage?: string }>`
  ${siderVideoBox}
  ${(props) =>
    props.scale &&
    css`
      width: ${videoWidth / 2}px;
      height: ${videoHeight / 2}px;
    `}
  ${(props) =>
    props.backgroundImage &&
    css`
      background: ${props.backgroundImage} no-repeat cover;
    `}
`;

const TeacherVideo = styled.div`
  ${siderVideoBox}
`;
