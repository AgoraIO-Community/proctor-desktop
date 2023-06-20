import { Select } from "antd";
import styled, { StyledComponent } from "styled-components";
import { AgoraMidBorderRadius } from "../common";
import { type } from "os";

export const AgoraSelect: StyledComponent<typeof Select, {}> = styled(Select)`
  ${AgoraMidBorderRadius}
  background: #fff;
  &.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    height: 48px;
    ${AgoraMidBorderRadius}
  }
  &.ant-select-single.ant-select-show-arrow .ant-select-selection-item {
    line-height: 48px;
  }
`;
