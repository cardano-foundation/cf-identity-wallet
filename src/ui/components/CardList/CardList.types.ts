import { ReactNode, MouseEvent as ReactMouseEvent } from "react";

interface CardItem<T> {
  title: string;
  subtitle?: string;
  image?: string;
  startSlot?: ReactNode;
  id: string | number;
  data: T;
}

interface CardItemProps<T> {
  card: CardItem<T>;
  onRenderCardAction?: (data: T) => ReactNode;
  onCardClick?: (data: T, e: ReactMouseEvent<HTMLElement, MouseEvent>) => void;
  onRenderEndSlot?: (data: T) => ReactNode;
  onRenderStartSlot?: (data: T) => ReactNode;
}

interface CardListProps<T extends object = object>
  extends Omit<CardItemProps<T>, "card"> {
  data: CardItem<T>[];
  lines?: "full" | "inset" | "none";
  className?: string;
  rounded?: boolean;
  testId?: string;
}

export type { CardItem, CardListProps, CardItemProps };
