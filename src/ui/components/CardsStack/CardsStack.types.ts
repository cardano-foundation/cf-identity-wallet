interface CardsStackProps {
  id: string;
  type: string;
  name: string;
  date: string;
  colors: string[];
  keyType?: string;
  controller?: string;
  publicKeyBase58?: string;
}

interface DidCardProps {
  cardData: CardsStackProps;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

interface CredCardProps {
  cardData: CardsStackProps;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails: (index: number | undefined) => void;
}

export type { CardsStackProps, DidCardProps, CredCardProps };
