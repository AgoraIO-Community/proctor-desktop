import { Modal } from "antd";
import styled, { css } from "styled-components";

const modalBorderRadius = css`
  border-radius: 0;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

export const AgoraModal = styled(Modal)`
  box-shadow: -1px 10px 60px rgba(0, 0, 0, 0.12);
  /* background: radial-gradient(483.9% 2719.65% at -49.5% -250%, rgba(215, 152, 225, 0.8) 17.55%, rgba(155, 255, 165, 0.8) 27.56%, rgba(174, 211, 255, 0.8) 49.89%, rgba(201, 212, 239, 0.8) 56.53%, rgba(202, 207, 250, 0.8) 65.69%); */
  background: #fff;
  ${modalBorderRadius}
  & .ant-modal-content {
    background: transparent;
    ${modalBorderRadius}
  }
  & .ant-modal-header {
    ${modalBorderRadius}
    background: transparent;
  }
  & .ant-modal-footer {
    height: 100px;
    box-sizing: border-box;
    padding: 0 49px;
  }
`;
