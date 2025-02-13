import { IonSpinner } from "@ionic/react";
import "./Spinner.scss";
import { SpinnerConverage, SpinnerProps } from "./Spinner.type";
import { combineClassNames } from "../../utils/style";

export const Spinner = ({
  show,
  coverage = SpinnerConverage.Screen,
}: SpinnerProps) => {
  if (!show) {
    return null;
  }

  const classes = combineClassNames("spinner-container", {
    screen: coverage === SpinnerConverage.Screen,
  });

  return (
    <div
      data-testid="spinner-container"
      className={classes}
    >
      <IonSpinner name="circular" />
    </div>
  );
};
