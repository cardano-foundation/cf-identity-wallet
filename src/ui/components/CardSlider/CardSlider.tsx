import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import {
  IdentifierDetails,
  IdentifierShortDetails,
} from "../../../core/agent/services/identifier.types";
import { useAppSelector } from "../../../store/hooks";
import { getIdentifierFavouriteIndex } from "../../../store/reducers/identifierViewTypeCache";
import { CardType } from "../../globals/types";
import { CredentialCardTemplate } from "../CredentialCardTemplate";
import { IdentifierCardTemplate } from "../IdentifierCardTemplate";
import { TabsRoutePath } from "../navigation/TabsMenu";
import "./CardSlider.scss";
import { CardSliderProps } from "./CardSlider.types";

const NAVIGATION_DELAY = 250;

const CardSlider = ({
  name,
  cardType,
  title,
  cardsData,
  onShowCardDetails,
}: CardSliderProps) => {
  const history = useHistory();
  const [swiper, setSwiper] = useState<SwiperClass | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const favouriteIndex = useAppSelector(getIdentifierFavouriteIndex);

  const handleShowCardDetails = async (index: number) => {
    let pathname = "";
    onShowCardDetails?.();
    if (cardType === CardType.IDENTIFIERS) {
      const data = cardsData[index] as IdentifierDetails;
      pathname = `${TabsRoutePath.IDENTIFIERS}/${data.id}`;
    } else {
      const data = cardsData[index] as CredentialShortDetails;
      pathname = `${TabsRoutePath.CREDENTIALS}/${data.id}`;
    }

    setTimeout(() => {
      history.push({ pathname: pathname });
    }, NAVIGATION_DELAY);
  };

  const saveFavouriteIndex = (index: number) => {
    setActiveIndex(() => index);
    Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_IDENTIFIER_FAVOURITE_INDEX,
        content: { favouriteIndex: index },
      })
    );
  };

  const slideToIndex = (index: number) => {
    swiper?.slideToLoop(index);
  };

  useEffect(() => {
    if (!swiper) return;
    swiper.slideTo(favouriteIndex, 300);
  }, [swiper]);

  const renderCards = (
    cardData: IdentifierShortDetails | CredentialShortDetails,
    index: number
  ) => {
    return cardType === CardType.IDENTIFIERS ? (
      <IdentifierCardTemplate
        name={name}
        key={index}
        index={index}
        isActive={false}
        cardData={cardData as IdentifierShortDetails}
        onHandleShowCardDetails={() => handleShowCardDetails(index)}
      />
    ) : (
      <CredentialCardTemplate
        name={name}
        key={index}
        index={index}
        isActive={false}
        cardData={cardData as CredentialShortDetails}
        onHandleShowCardDetails={() => handleShowCardDetails(index)}
      />
    );
  };

  return (
    <div className="card-slider">
      <div className="card-slider-header">
        <h3>{title}</h3>
        <div className="pagination">
          {cardsData.length > 1 &&
            cardsData.map((_, index) => (
              <div
                data-testid={`slide-pagination-${index}`}
                onClick={() => slideToIndex(index)}
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
      <Swiper
        className="swiper-container"
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={(swiper) => {
          saveFavouriteIndex(swiper.realIndex);
        }}
        slidesPerView={1}
        loop={true}
        data-testid="card-slide-container"
      >
        {cardsData.map((card, index) => (
          <SwiperSlide
            data-testid={`card-slide-container-${card.id}`}
            className="swiper-item"
            key={index}
          >
            {renderCards(card, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { CardSlider };
