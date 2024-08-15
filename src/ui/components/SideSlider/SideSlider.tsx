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
  const prevOpenState = useRef(false);
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
    // NOTE: Because IonApp renders twice, it make leave animation run when page render. Need check isOpen state change to make sure animation run correctly.
    if (!sliderEl?.current || renderAsModal || prevOpenState.current === isOpen)
      return;
    prevOpenState.current = isOpen;

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
      className={classes}
    >
      {children}
    </div>
  );
};

export { SideSlider };
