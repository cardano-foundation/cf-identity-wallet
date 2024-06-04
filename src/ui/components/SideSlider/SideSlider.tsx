import { IonModal, createAnimation } from "@ionic/react";
import { SideSliderProps } from "./SideSlider.types";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";

const SIDE_SLIDER_Z_INDEX = 103;

const SideSlider = ({
  open,
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
        .duration(500)
        .fromTo("transform", "translateX(100%)", "translateX(0)")
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
        isOpen={open}
        data-testid="side-slider"
        enterAnimation={enterAnimation}
        leaveAnimation={leaveAnimation}
      >
        {children}
      </IonModal>
    );
  }

  const classes = combineClassNames(
    "side-slider-container",
    open ? "open" : "close"
  );

  return (
    <div
      style={{
        zIndex,
      }}
      data-testid="side-slider"
      onTransitionEnd={(e) => {
        open ? onOpenAnimationEnd?.() : onCloseAnimationEnd?.();
      }}
      className={classes}
    >
      {children}
    </div>
  );
};

export { SideSlider };
