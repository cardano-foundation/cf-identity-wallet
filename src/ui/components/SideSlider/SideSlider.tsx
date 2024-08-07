import { IonModal, createAnimation } from "@ionic/react";
import { ANIMATION_DURATION, SideSliderProps } from "./SideSlider.types";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";

const SIDE_SLIDER_Z_INDEX = 103;

const SideSlider = ({
  isOpen,
  children,
  renderAsModal = false,
  zIndex = SIDE_SLIDER_Z_INDEX,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
}: SideSliderProps) => {
  if (renderAsModal) {
    const slideAnimation = (baseEl: HTMLElement) => {
      const root = baseEl.shadowRoot;
      const modalWrapper = root?.querySelector(".modal-wrapper") ?? baseEl;

      return createAnimation()
        .addElement(modalWrapper)
        .easing("ease-out")
        .duration(ANIMATION_DURATION)
        .fromTo("transform", "translateX(100%)", "translateX(0)")
        .fromTo("opacity", 1, 1)
        .afterStyles({
          opacity: 1,
        });
    };

    const enterAnimation = (baseEl: HTMLElement) => {
      return slideAnimation(baseEl).onFinish(() => {
        onOpenAnimationEnd?.();
      });
    };

    const leaveAnimation = (baseEl: HTMLElement) => {
      return slideAnimation(baseEl)
        .direction("reverse")
        .onFinish((e) => {
          onCloseAnimationEnd?.();
        });
    };

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

  const classes = combineClassNames(
    "side-slider-container",
    isOpen ? "open" : "close"
  );

  return (
    <div
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
