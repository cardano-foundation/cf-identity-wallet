import { useState } from "react";
import { IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { eyeOutline, checkmarkCircleOutline } from "ionicons/icons";
import { Swiper as SwiperClass } from "swiper/types";
import { CryptoBalanceProps } from "./CryptoBalance.types";
import "./CryptoBalance.scss";
import { i18n } from "../../../i18n";

const CryptoBalance = ({ items }: CryptoBalanceProps) => {
  const [swiper, setSwiper] = useState<SwiperClass | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="crypto-balance">
      <div className="account-network">
        <span>{i18n.t("crypto.tab.network.mainnet")}</span>
      </div>
      <div className="slides">
        <Swiper
          className="swiper-container"
          onSwiper={(swiper) => setSwiper(swiper)}
          onSlideChange={() =>
            swiper ? setActiveIndex(swiper.realIndex) : null
          }
          slidesPerView={1}
        >
          {items.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className={`slide-title${
                  activeIndex === index ? " text-fadein" : ""
                }`}
              >
                <span>{slide.title}</span>
                <IonIcon
                  slot="icon-only"
                  icon={eyeOutline}
                  color="primary"
                />
              </div>
              <h1
                className={`slide-fiatbalance${
                  activeIndex === index ? " text-fadein" : ""
                }`}
              >
                {slide.fiatBalance}
              </h1>
              <div
                className={`slide-nativebalance${
                  activeIndex === index ? " text-fadein" : ""
                }`}
              >
                <IonIcon
                  slot="icon-only"
                  icon={checkmarkCircleOutline}
                  color="dark-green"
                />
                <span>{slide.nativeBalance}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pagination">
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
        </div>
      </div>
    </div>
  );
};

export { CryptoBalance };
