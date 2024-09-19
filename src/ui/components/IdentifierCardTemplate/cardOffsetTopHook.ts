import { useRef } from "react";
import { useScreenSize } from "../../hooks";

const useCardOffsetTop = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const width = useScreenSize();

  // Calc distance from top of card to previous card
  const getCardOffsetTop = () => {
    if (!cardRef.current) return 0;

    const isSmallDevice = width >= 250 && width <= 370;

    // card height - margin top (rem) (if screen size greater than 250 px and less than 370px margin is 7.5rem)
    return cardRef.current.offsetHeight - (isSmallDevice ? 7.5 : 10) * 16;
  };

  return { cardRef, getCardOffsetTop };
};

export { useCardOffsetTop };
