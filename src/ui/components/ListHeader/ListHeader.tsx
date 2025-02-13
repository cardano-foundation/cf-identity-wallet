import { IonIcon } from "@ionic/react";
import { layersOutline, listOutline, layers } from "ionicons/icons";
import { ListHeaderProps } from "./ListHeader.types";
import { combineClassNames } from "../../utils/style";
import "./ListHeader.scss";

const ListHeader = ({
  title,
  activeActionIndex = 0,
  hasAction,
  firstIcon,
  secondIcon,
  onFirstIconClick,
  onSecondIconClick,
}: ListHeaderProps) => {
  const containerClass = combineClassNames("list-header", {
    "has-actions": !!hasAction,
  });

  const getIconClass = (index: number) =>
    combineClassNames("header-action", {
      active: index === activeActionIndex,
    });

  const displayFirstIcon =
    firstIcon || activeActionIndex ? layersOutline : layers;
  const displaySecondIcon = secondIcon || listOutline;

  return (
    <div
      className={containerClass}
      data-testid="list-header"
    >
      <h3
        data-testid={`list-header-title-${title
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
        className="list-header-title"
      >
        {title}
      </h3>
      {hasAction && (
        <div className="list-header-actions">
          <div className={getIconClass(0)}>
            <IonIcon
              data-testid="list-header-first-icon"
              onClick={onFirstIconClick}
              icon={displayFirstIcon}
            />
          </div>
          <div className={getIconClass(1)}>
            <IonIcon
              data-testid="list-header-second-icon"
              onClick={onSecondIconClick}
              icon={displaySecondIcon}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { ListHeader };
