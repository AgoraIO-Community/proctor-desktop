import { Slider, SliderSingleProps } from 'antd';
import React, { FC } from 'react';
export const AgoraSlider: FC<SliderSingleProps & React.RefAttributes<unknown>> = ({ ...props }) => {
  return <Slider {...props}></Slider>;
};
