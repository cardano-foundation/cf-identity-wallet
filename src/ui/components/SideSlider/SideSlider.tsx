import { IonModal, createAnimation } from "@ionic/react";
import { useCallback, useEffect, useRef } from "react";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";
import { ANIMATION_DURATION, SideSliderProps } from "./SideSlider.types";

const SIDE_SLIDER_Z_INDEX = 103;

const SideSlider = ({
  isOpen,
  children,
  renderAsModal = false,
  zIndex = SIDE_SLIDER_Z_INDEX,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
}: SideSliderProps) => {
  const sliderEl = useRef<HTMLDivElement | null>(null);

  const slideAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const modalWrapper = root?.querySelector(".modal-wrapper") ?? baseEl;

    return createAnimation()
      .addElement(modalWrapper)
      .duration(ANIMATION_DURATION)
      .fromTo("transform", "translateX(100%)", "translateX(0)")
      .fromTo("opacity", 1, 1)
      .afterStyles({
        opacity: 1,
      });
  };

  const enterAnimation = useCallback(
    (baseEl: HTMLElement) => {
      return slideAnimation(baseEl).onFinish(() => {
        onOpenAnimationEnd?.();
      });
    },
    [onOpenAnimationEnd]
  );

  const leaveAnimation = useCallback(
    (baseEl: HTMLElement) => {
      return slideAnimation(baseEl)
        .direction("reverse")
        .onFinish(() => {
          onCloseAnimationEnd?.();
        });
    },
    [onCloseAnimationEnd]
  );

  useEffect(() => {
    if (!sliderEl?.current || renderAsModal) return;

    if (!isOpen) {
      leaveAnimation(sliderEl.current).play();
    } else {
      enterAnimation(sliderEl.current).play();
    }
  }, [enterAnimation, isOpen, leaveAnimation, renderAsModal]);

  if (renderAsModal) {
    return (
      <IonModal
        isOpen={isOpen}
        data-testid="side-slider"
        enterAnimation={enterAnimation}
        leaveAnimation={leaveAnimation}
        className="side-slider-modal"
      >
        {children}
      </IonModal>
    );
  }

  const classes = combineClassNames("side-slider-container");

  return (
    <div
      ref={sliderEl}
      style={{
        zIndex,
      }}
      data-testid="side-slider"
      onTransitionEnd={() => {
        isOpen ? onOpenAnimationEnd?.() : onCloseAnimationEnd?.();
      }}
      className={classes}
    >
      {children}
    </div>
  );
};

export { SideSlider };
