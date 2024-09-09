import { IonModal } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";
import { SideSliderProps } from "./SideSlider.types";

const SIDE_SLIDER_Z_INDEX = 103;
const ANIMATION_DURATION = 600;
const DELAY_TIME = 100;

const SideSlider = ({
  isOpen,
  children,
  onCloseAnimationEnd,
  onOpenAnimationEnd,
  renderAsModal = false,
  zIndex = SIDE_SLIDER_Z_INDEX,
}: SideSliderProps) => {
  const [cssClass, setCssClass] = useState<string | undefined>(
    "side-slider-container"
  );
  const [innerOpen, setInnerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInnerOpen(true);
    } else {
      setTimeout(() => {
        setInnerOpen(false);
      }, ANIMATION_DURATION);
    }

    const timer = setTimeout(() => {
      setCssClass(() =>
        combineClassNames("side-slider-container", {
          "slide-in-left": isOpen,
        })
      );
    }, DELAY_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  const registerEvent = useCallback(() => {
    if (isOpen) {
      onOpenAnimationEnd?.();
    } else {
      onCloseAnimationEnd?.();
    }
  }, [isOpen, onCloseAnimationEnd, onOpenAnimationEnd]);

  if (renderAsModal) {
    return (
      <IonModal
        isOpen={innerOpen}
        data-testid="side-slider"
        className={cssClass}
        animated={false}
        onTransitionEnd={registerEvent}
      >
        {children}
      </IonModal>
    );
  }

  return (
    <div
      style={{
        zIndex,
      }}
      data-testid="side-slider"
      className={cssClass}
      onTransitionEnd={registerEvent}
    >
      {children}
    </div>
  );
};

export { SideSlider };
