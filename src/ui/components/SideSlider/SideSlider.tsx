import { SideSliderProps } from "./SideSlider.types";
import { combineClassNames } from "../../utils/style";
import "./SideSlider.scss";

const SIDE_SLIDER_Z_INDEX = 103;

const SideSlider = ({
  open,
  children,
  zIndex = SIDE_SLIDER_Z_INDEX,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
}: SideSliderProps) => {
  const classes = combineClassNames(
    "side-slider-container",
    open ? "open" : "close"
  );

  return (
    <div
      style={{
        zIndex,
      }}
      onTransitionEnd={(e) => {
        open ? onOpenAnimationEnd?.(e) : onCloseAnimationEnd?.(e);
      }}
      className={classes}
    >
      {children}
    </div>
  );
};

export { SideSlider };
