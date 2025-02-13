import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import {
  IdentifierDetails,
  IdentifierShortDetails,
} from "../../../core/agent/services/identifier.types";
import { useAppSelector } from "../../../store/hooks";
import {
  getCredentialFavouriteIndex,
  getIdentifierFavouriteIndex,
} from "../../../store/reducers/viewTypeCache";
import { CardType } from "../../globals/types";
import { CredentialCardTemplate } from "../CredentialCardTemplate";
import { IdentifierCardTemplate } from "../IdentifierCardTemplate";
import { TabsRoutePath } from "../navigation/TabsMenu";
import "./CardSlider.scss";
import { CardProps, CardSliderProps } from "./CardSlider.types";

const NAVIGATION_DELAY = 250;
const RESET_ANIMATION = 350;

const Card = ({
  cardType,
  name,
  index,
  cardData,
  handleShowCardDetails,
  pickedCard,
}: CardProps) => {
  return cardType === CardType.IDENTIFIERS ? (
    <IdentifierCardTemplate
      name={name}
      key={index}
      index={index}
      isActive={false}
      cardData={cardData as IdentifierShortDetails}
      onHandleShowCardDetails={() => handleShowCardDetails(index)}
      pickedCard={pickedCard === index}
    />
  ) : (
    <CredentialCardTemplate
      name={name}
      key={index}
      index={index}
      isActive={false}
      cardData={cardData as CredentialShortDetails}
      onHandleShowCardDetails={() => handleShowCardDetails(index)}
      pickedCard={pickedCard === index}
    />
  );
};

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
  const [pickedCardIndex, setPickedCardIndex] = useState<number | null>(null);
  const identifierFavouriteIndex = useAppSelector(getIdentifierFavouriteIndex);
  const credFavouriteIndex = useAppSelector(getCredentialFavouriteIndex);
  const isIdentifier = cardType === CardType.IDENTIFIERS;
  const favouriteIndex = isIdentifier
    ? identifierFavouriteIndex
    : credFavouriteIndex;

  const handleShowCardDetails = async (index: number) => {
    setPickedCardIndex(index);

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

    setTimeout(() => {
      setPickedCardIndex(null);
    }, RESET_ANIMATION);
  };

  const saveFavouriteIndex = (index: number) => {
    setActiveIndex(() => index);
    Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: isIdentifier
          ? MiscRecordId.APP_IDENTIFIER_FAVOURITE_INDEX
          : MiscRecordId.APP_CRED_FAVOURITE_INDEX,
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

  const containerClasses = `card-slider ${
    pickedCardIndex !== null ? "transition-start" : ""
  }`;

  return (
    <div className={containerClasses}>
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
        slidesPerView={"auto"}
        centeredSlides={true}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="swiper-container"
        onSwiper={(swiper: SwiperClass) => setSwiper(swiper)}
        onSlideChange={(swiper: SwiperClass) => {
          saveFavouriteIndex(swiper.realIndex);
        }}
        data-testid="card-slide-container"
      >
        {cardsData.map((card, index) => (
          <SwiperSlide
            data-testid={`card-slide-container-${card.id}`}
            className="swiper-item"
            key={index}
          >
            <Card
              cardData={card}
              cardType={cardType}
              name={name}
              index={index}
              handleShowCardDetails={handleShowCardDetails}
              pickedCard={pickedCardIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { CardSlider };
