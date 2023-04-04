import { useState } from "react";
import {IonButton, IonContent, IonIcon, IonPage} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { playCircleOutline, pauseCircleOutline } from "ionicons/icons";
import { Autoplay } from "swiper";

import "./style.scss";

const Onboarding = () => {
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayIsClicked, setAutoplayIsClicked] = useState(false);

  const slides = [
    {
      title: "Welcome to your Cardano Foundation Identity Wallet",
      description:
        "A secure and easy-to-use tool that allows you to manage your digital identity and control your personal data",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Securerly manage your digital identity",
      description:
        "Securely manage your digital identity and share your personal data with confidence",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Take control of your personal data",
      description:
        "Say goodbye to the days of handing over your personal data to third-party companies",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Verify your identity with ease",
      description:
        "Verify your identity for various online services, without sharing unnecessary personal information",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Experience the power of decentralized identity",
      description:
        "As a decentralized identity platform, you take control of your digital identity and your personal data",
      image: "https://placehold.co/290x290",
    },
  ];

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
    setTimeout(() => {
      setAutoplayIsClicked(false);
    }, 300);
  };

  const handleSlideChange = () => {
    if (!swiper) return;
    setActiveIndex(swiper.realIndex);
  };

  return (
    <>
      <IonPage>
        <IonContent>
          <Swiper
              className="swiper-container2"
              onSwiper={(swiper) => setSwiper(swiper)}
              onSlideChange={handleSlideChange}
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
                      activeIndex === index
                          ? "page-indicator-active"
                          : "page-indicator"
                    }
                />
            ))}
            <div className="play-container">
              <IonIcon
                  className={`play-indicator ${
                      autoplayIsClicked ? "clicked" : ""
                  }`}
                  icon={autoplay ? pauseCircleOutline : playCircleOutline}
                  onClick={handleAutoplay}
              />
            </div>
          </div>
          <IonButton
              className="next-button"
              onClick={() => {}}
          >
            Get Started
          </IonButton>
          <div className="already-wallet">I already have a wallet</div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Onboarding;
