import { IonModal } from "@ionic/react";
import { useEffect, useState } from "react";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";
import { SideSliderProps } from "./SideSlider.types";

const SIDE_SLIDER_Z_INDEX = 103;
const ANIMATION_DURATION = 600;
const DELAY_TIME = 100;

const SideSlider = ({
  isOpen,
  children,
  renderAsModal = false,
  zIndex = SIDE_SLIDER_Z_INDEX,
}: SideSliderProps) => {
  const baseClass = renderAsModal
    ? "side-slider-modal"
    : "side-slider-container";
  const [cssClass, setCssClass] = useState<string | undefined>(baseClass);
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
        combineClassNames(baseClass, {
          "slide-in-left": isOpen,
        })
      );
    }, DELAY_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, baseClass]);

  if (renderAsModal) {
    return (
      <IonModal
        isOpen={innerOpen}
        data-testid="side-slider"
        className={cssClass}
        animated={false}
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
    >
      {children}
    </div>
  );
};

export { SideSlider };
