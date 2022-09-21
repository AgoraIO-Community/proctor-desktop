import { Popover } from "antd";
import { useCallback, useState } from "react";
import { SketchPicker } from "react-color";
import styled from "styled-components";
import tinycolor from "tinycolor2";

const number = 10;

export const ColorPage = () => {
  const [color, setColor] = useState("#1890ff");

  const handleChangeComplete = useCallback((color) => {
    setColor((pre) => color.hex);
  }, []);
  return (
    <ContainerColorWrapper>
      <Popover
        placement="leftBottom"
        content={
          <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
        }
      >
        baseColor {color} <ContainerColor color={color} />
      </Popover>
      <Container>
        {Array(number)
          .fill("")
          .map((_, index) => (
            <ColorGenerated color={color} index={index + 1}>
              {index + 1 === 6 ? color : colorPalette(color, index + 1)}
            </ColorGenerated>
          ))}
      </Container>
    </ContainerColorWrapper>
  );
};

const ContainerColorWrapper = styled.div`
  width: 1000px;
  margin: 0 auto;
  padding: 40px;
`;
const ContainerColor = styled.div<{ color: string }>`
  width: 100px;
  height: 30px;
  margin-bottom: 40px;
  background-color: ${(props) => props.color};
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const hueStep = 2;
const saturationStep = 0.16;
const saturationStep2 = 0.05;
const brightnessStep1 = 0.05;
const brightnessStep2 = 0.15;
const lightColorCount = 5;
const darkColorCount = 4;

const getHue = function (hsv: any, i: number, isLight: boolean) {
  var hue;
  if (hsv.h >= 60 && hsv.h <= 240) {
    hue = isLight ? hsv.h - hueStep * i : hsv.h + hueStep * i;
  } else {
    hue = isLight ? hsv.h + hueStep * i : hsv.h - hueStep * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return Math.round(hue);
};
const getSaturation = function (hsv: any, i: number, isLight: boolean) {
  // grey color don't change saturation
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }
  var saturation;
  if (isLight) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  }
  if (saturation > 1) {
    saturation = 1;
  }
  if (isLight && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }
  if (saturation < 0.06) {
    saturation = 0.06;
  }
  return Number(saturation.toFixed(2));
};
const getValue = function (hsv: any, i: number, isLight: boolean) {
  var value;
  if (isLight) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }
  if (value > 1) {
    value = 1;
  }
  return Number(value.toFixed(2));
};

const colorPalette = function (color: any, index: number) {
  var isLight = index <= 6;
  var hsv = tinycolor(color).toHsv();
  var i = isLight ? lightColorCount + 1 - index : index - lightColorCount - 1;
  return tinycolor({
    h: getHue(hsv, i, isLight),
    s: getSaturation(hsv, i, isLight),
    v: getValue(hsv, i, isLight),
  }).toHexString();
};

const ColorGenerated = styled.div<{ color: string; index: number }>`
  width: 100px;
  height: 40px;
  line-height: 40px;
  background-color: ${(props) =>
    props.index === 6 ? props.color : colorPalette(props.color, props.index)};
  font-weight: 400;
  font-size: 12px;
  color: ${(props) => (props.index >= 6 ? "#fff" : "#000")};
`;
