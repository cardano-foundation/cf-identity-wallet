import { useState } from "react";
import {IonButton, IonContent, IonIcon, IonPage} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { arrowForward } from 'ionicons/icons';
import { Autoplay } from 'swiper';


import "./style.scss";


const Onboarding = () => {
    const [swiper, setSwiper] = useState<any>(null);

    const [activeIndex, setActiveIndex] = useState(0);

    const slides = [
        {
            title: 'Feature 0',
            description: 'This app will help you...',
            image: 'https://placehold.co/290x290',
        },
        {
            title: 'Feature 1',
            description: 'This feature will allow you to...',
            image: 'https://placehold.co/290x290',
        },
        {
            title: 'Feature 2',
            description: 'This feature will allow you to...',
            image: 'https://placehold.co/290x290',
        },
    ];

    const handleNext = () => {
        if (swiper !== null) {
            swiper.slideNext();
        }
    };

    const handleSlideChange = () => {
        if (swiper !== null) {
            setActiveIndex(swiper.activeIndex);
        }
    };

  return (
    <>
        <IonPage>
            <Swiper
                className="swiper-container"
                onSwiper={(swiper) => setSwiper(swiper)}
                onSlideChange={handleSlideChange}
                slidesPerView={1}
                autoplay={true}
                modules={[Autoplay]}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <img src={slide.image} alt={slide.title} />
                        <h2>{slide.title}</h2>
                        <p>{slide.description}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="pagination">
                {slides.map((_, index) => (
                    <IonIcon key={index} icon={index === activeIndex ? 'radio-button-on' : 'radio-button-off'} />
                ))}
            </div>
            <IonButton className="next-button" onClick={handleNext} disabled={!(activeIndex === slides.length - 1)}>
                Next <IonIcon slot="end" icon={arrowForward} />
            </IonButton>
        </IonPage>
    </>
  );
};

export default Onboarding;
