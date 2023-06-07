import { CardsStackProps } from "../../../ui/components/CardsStack/CardsStack.types";

interface DidProps {
  cardProps: {
    cardType: string;
    cardColor: string;
  };
  cardData: CardsStackProps[];
}

export type { DidProps };
