import { useState } from "react";
import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { arrowForward } from "ionicons/icons";
import { Autoplay } from "swiper";

import "./style.scss";

const Onboarding = () => {
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesSeen] = useState<Set<number>>(new Set());

  slidesSeen.add(0);
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

  const handleNext = () => {
    if (swiper !== null) {
      swiper.slideNext();
    }
  };

  const handleSlideChange = () => {
    if (swiper !== null) {
      setActiveIndex(swiper.realIndex);
      slidesSeen.add(swiper.realIndex);
    }
  };

  return (
    <>
      <IonPage>

        <div className="content">
          <Swiper
              className="swiper-container"
              onSwiper={(swiper) => setSwiper(swiper)}
              onSlideChange={handleSlideChange}
              slidesPerView={1}
              autoplay={true}
              loop={true}
              modules={[Autoplay]}
          >
            {slides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <img
                      src={slide.image}
                      alt={slide.title}
                      className={
                        activeIndex === index
                            ? "text-fadein-down"
                            : ""
                      }
                  />
                  <h2 className={
                    activeIndex === index
                        ? "text-fadein"
                        : ""
                  }>{slide.title}</h2>
                  <p className={
                    activeIndex === index
                        ? "text-fadein"
                        : ""
                  }>{slide.description}</p>
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
          </div>
          <IonButton
              className="next-button"
              onClick={() => {}}
              disabled={!(slidesSeen.size === slides.length)}
          >
            Get Started
          </IonButton>
          <div className="already-wallet">I already have a wallet</div>
        </div>
      </IonPage>
    </>
  );
};

export default Onboarding;
