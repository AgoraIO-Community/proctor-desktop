import { Button, ButtonProps } from "antd";
import React, { FC } from "react";
import styled, { css } from "styled-components";
import { AgoraMidBorderRadius } from "../common";

type primarySubType = "black" | "original";
type AgoraButtonProps = ButtonProps &
  React.RefAttributes<HTMLElement> & { subType?: primarySubType };

const ButtonComponent: FC<AgoraButtonProps> = ({ subType, ...props }) => {
  return React.createElement(Button, props);
};

const black = css`
  background: #000;
  border-color: #000;
`;

const original = css`
  background: #f8f8f8;
  border-color: #f8f8f8;
  color: #000;
`;

const selectPrimaryCss = (type: primarySubType) => {
  switch (type) {
    case "black":
      return black;
    case "original":
      return original;
  }
};

export const AgoraButton = styled(ButtonComponent)<AgoraButtonProps>`
  &.ant-btn-lg {
    height: 50px;
  }
  ${(props) => {
    switch (props.size) {
      case "large":
        return AgoraMidBorderRadius;
      default:
        break;
    }
  }}
  ${(props) => {
    if (props.subType) {
      return css`
        &.ant-btn-primary {
          ${selectPrimaryCss(props.subType)}
        }
        &.ant-btn-primary:hover,
        &.ant-btn-primary:focus {
          ${selectPrimaryCss(props.subType)}
          opacity: 0.8;
        }
        &.ant-btn-primary:focus {
          opacity: 1;
        }
      `;
    }
  }}
`;
