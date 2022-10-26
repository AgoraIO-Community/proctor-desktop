import { Carousel, CarouselProps } from 'antd';
import React, { FC } from 'react';
interface CarouselRef {
  goTo: (slide: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
  autoPlay: (palyType?: 'update' | 'leave' | 'blur') => void;
  innerSlider: any;
}
export const AgoraCarousel: FC<CarouselProps & React.RefAttributes<CarouselRef>> = ({
  ...props
}) => {
  return <Carousel {...props}></Carousel>;
};
