import { useState } from "react";
import { IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { Swiper as SwiperClass } from "swiper/types";
import { CryptoBalanceProps } from "./CryptoBalance.types";
import "./CryptoBalance.scss";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getHideCryptoBalances,
  setHideCryptoBalances,
} from "../../../store/reducers/cryptoAccountsCache";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences/preferencesStorage";

const CryptoBalance = ({ items }: CryptoBalanceProps) => {
  const dispatch = useAppDispatch();
  const [swiper, setSwiper] = useState<SwiperClass | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hidden, setHidden] = useState(useAppSelector(getHideCryptoBalances));

  const handleToggleHide = () => {
    dispatch(setHideCryptoBalances(!hidden));
    PreferencesStorage.set(PreferencesKeys.APP_HIDE_CRYPTO_BALANCES, {
      hidden: !hidden,
    });
    setHidden(!hidden);
  };

  return (
    <div
      className={`crypto-balance-container${hidden ? " hide-balance" : ""}`}
      data-testid="crypto-balance-container"
    >
      <div className="account-network">
        <span>{i18n.t("crypto.tab.network.mainnet")}</span>
      </div>
      <Swiper
        data-testid="crypto-balance-swiper"
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={() => (swiper ? setActiveIndex(swiper.realIndex) : null)}
        slidesPerView={1}
        onClick={handleToggleHide}
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
                icon={hidden ? eyeOffOutline : eyeOutline}
                color="primary"
              />
            </div>
            <h1
              className={`balance slide-fiatbalance${
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
              <span className="balance">{slide.nativeBalance}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="slides pagination">
        {items.map((_, index) => (
          <div
            key={index}
            className={
              activeIndex === index ? "page-indicator-active" : "page-indicator"
            }
          />
        ))}
      </div>
    </div>
  );
};

export { CryptoBalance };
