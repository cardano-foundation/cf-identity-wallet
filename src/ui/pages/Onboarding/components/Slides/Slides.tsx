import { IonIcon } from "@ionic/react";
import { pauseCircleOutline, playCircleOutline } from "ionicons/icons";
import Lottie from "lottie-react";
import { useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper/types";
import "./Slides.scss";
import { SlideProps } from "./Slides.types";
import "swiper/css";
import "swiper/css/autoplay";
import "@ionic/react/css/ionic-swiper.css";

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
    <div className="slides-container">
      <div className="slides">
        <Swiper
          className="swiper-container"
          onSwiper={(swiper: SwiperClass) => setSwiper(swiper)}
          onSlideChange={() =>
            swiper ? setActiveIndex(swiper.realIndex) : null
          }
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
              {slide.lottie ? (
                <Lottie
                  className={activeIndex === index ? "text-fadein-down" : ""}
                  animationData={slide.lottie}
                  loop={false}
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`image ${
                    activeIndex === index ? "text-fadein-down" : ""
                  }`}
                />
              )}
              {slide.title && (
                <h2 className={activeIndex === index ? "text-fadein" : ""}>
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className={activeIndex === index ? "text-fadein" : ""}>
                  {slide.description}
                </p>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {items.length > 1 && (
        <div
          data-testid="slide-controls"
          className="pagination"
        >
          {items.map((_, index) => (
            <div
              key={index}
              className={
                activeIndex === index
                  ? "page-indicator-active"
                  : "page-indicator"
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
      )}
    </div>
  );
};

export { Slides };
