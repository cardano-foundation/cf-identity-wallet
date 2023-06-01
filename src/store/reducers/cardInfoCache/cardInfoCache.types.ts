import { CardsStackProps } from "../../../ui/components/CardsStack/CardsStack.types";

interface CardInfoCacheProps {
  cardProps: {
    cardType: string;
    cardColor: string;
  };
  cardData: CardsStackProps[];
}

export type { CardInfoCacheProps };
