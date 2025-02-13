import { combineClassNames } from "../../utils/style";
import { CardThemeProps } from "./CardTheme.types";
import { CardThemeFour } from "./CardThemeFour";
import { CardThemeOne } from "./CardThemeOne";
import { CardThemeThree } from "./CardThemeThree";
import { CardThemeTwo } from "./CardThemeTwo";
import "./CardTheme.scss";

export const CardTheme = ({
  className,
  layout = 0,
  color = 0,
}: CardThemeProps) => {
  const classNames = combineClassNames(className, `card-theme theme-${color}`);

  switch (layout) {
    case 0:
      return <CardThemeOne className={classNames} />;
    case 1:
      return <CardThemeTwo className={classNames} />;
    case 2:
      return <CardThemeThree className={classNames} />;
    default:
      return <CardThemeFour className={classNames} />;
  }
};
