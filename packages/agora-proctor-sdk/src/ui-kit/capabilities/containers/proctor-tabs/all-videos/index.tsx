import { StudentCard } from "../../student-card";
import { Carousel } from "antd";
import "./index.css";
import { useRef, useEffect, useState } from "react";
import { debounce } from "lodash";
import { CarouselRef } from "antd/lib/carousel";
import { observer } from "mobx-react";
import { useStore } from "@/infra/hooks/ui-store";
import { VideosWallLayoutEnum } from "@/infra/stores/common/type";
import { SvgIconEnum, SvgImg } from "~ui-kit";

export const AllVideos = observer(() => {
  const {
    layoutUIStore: { videosWallLayout },
  } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  useEffect(() => {
    setContainerHeight(containerRef.current?.clientHeight || 0);
  }, []);
  const onWheel = debounce((e) => {
    if (e.deltaY > 0) {
      next();
    } else if (e.deltaY < 0) {
      prev();
    }
  }, 20);
  const afterCarouselChange = (currentSlide: number) => {
    setCurrentPage(currentSlide);
  };
  const prev = () => {
    if (!carouselRef.current) return;

    carouselRef.current.prev();
  };
  const next = () => {
    if (!carouselRef.current) return;

    carouselRef.current.next();
  };
  return (
    <div className="fcr-all-videos-tab" ref={containerRef}>
      <div className="fcr-all-videos-tab-controller">
        <div className="fcr-all-videos-tab-controller-prev" onClick={prev}>
          <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_UP}></SvgImg>
        </div>
        <div className="fcr-all-videos-tab-controller-info">
          <span>20</span>
          <span>/</span>
          <span>30</span>
        </div>
        <div className="fcr-all-videos-tab-controller-next" onClick={next}>
          <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_DOWN}></SvgImg>
        </div>
      </div>
      <div className="fcr-all-videos-tab-page" onWheel={onWheel}>
        <Carousel
          initialSlide={0}
          dots={false}
          ref={carouselRef}
          vertical
          verticalSwiping
          infinite={false}
          lazyLoad="ondemand"
          afterChange={afterCarouselChange}
        >
          <div>
            <div
              className={`fcr-all-videos-tab-page-item fcr-all-videos-tab-page-item-${VideosWallLayoutEnum[
                videosWallLayout
              ].toLowerCase()}`}
              style={{ height: containerHeight }}
            >
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
            </div>
          </div>
          <div>
            <div
              className={`fcr-all-videos-tab-page-item fcr-all-videos-tab-page-item-${VideosWallLayoutEnum[
                videosWallLayout
              ].toLowerCase()}`}
              style={{ height: containerHeight }}
            >
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
              <StudentCard></StudentCard>
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
});
