import { useState } from "react";
import { IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { playCircleOutline, pauseCircleOutline } from "ionicons/icons";
import { Autoplay } from "swiper";
import { Swiper as SwiperClass } from "swiper/types";
import { SlideProps } from "./Slides.types";
import "./Slides.scss";

const Slides = ({ items }: SlideProps) => {
  const [swiper, setSwiper] = useState<SwiperClass | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayIsClicked, setAutoplayIsClicked] = useState(false);

  const handleAutoplay = () => {
    if (autoplay) {
      swiper?.autoplay?.stop();
      setAutoplay(false);
    } else {
      swiper?.autoplay?.start();
      setAutoplay(true);
    }

    setAutoplayIsClicked(true);
    setTimeout(() => setAutoplayIsClicked(false), 300);
  };

  return (
    <>
      <Swiper
        className="swiper-container"
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={() => (swiper ? setActiveIndex(swiper.realIndex) : null)}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        modules={[Autoplay]}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={index}>
            <img
              src={slide.image}
              alt={slide.title}
              className={activeIndex === index ? "text-fadein-down" : ""}
            />
            <h2 className={activeIndex === index ? "text-fadein" : ""}>
              {slide.title}
            </h2>
            <p className={activeIndex === index ? "text-fadein" : ""}>
              {slide.description}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="pagination">
        {items.map((_, index) => (
          <div
            key={index}
            className={
              activeIndex === index ? "page-indicator-active" : "page-indicator"
            }
          />
        ))}
        <div className="play-container">
          <IonIcon
            data-testid="play-indicator"
            className={`play-indicator ${autoplayIsClicked ? "clicked" : ""}`}
            icon={autoplay ? pauseCircleOutline : playCircleOutline}
            onClick={handleAutoplay}
          />
        </div>
      </div>
    </>
  );
};

export { Slides };
