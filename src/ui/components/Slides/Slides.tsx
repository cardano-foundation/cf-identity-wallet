import { useState } from "react";
import { IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { playCircleOutline, pauseCircleOutline } from "ionicons/icons";
import { Autoplay } from "swiper";
import { ISlide } from "./Slides.types";
import "./style.scss";

const Slides = ({ slides }: { slides: ISlide[] }) => {
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayIsClicked, setAutoplayIsClicked] = useState(false);

  const handleAutoplay = () => {
    if (!swiper) return;

    if (autoplay) {
      swiper.autoplay?.stop();
      setAutoplay(false);
    } else {
      swiper.autoplay?.start();
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
        {slides.map((slide, index) => (
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
        {slides.map((_, index) => (
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
