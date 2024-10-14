import { IonCard } from "@ionic/react";
import { CardDetailsBlockProps } from "./CardDetailsBlock.types";
import { combineClassNames } from "../../../utils/style";
import "./CardDetailsBlock.scss";

const CardDetailsBlock = ({
  title,
  action,
  children,
  className,
}: CardDetailsBlockProps) => {
  const classes = combineClassNames("card-details-info-block", className);

  return (
    <div className={classes}>
      <div className="card-details-info-block-header">
        {title && (
          <h4
            data-testid={`card-block-title-${title
              .replace(/\s+/g, "")
              .toLowerCase()}`}
            className="card-details-info-block-title"
          >
            {title}
          </h4>
        )}
        {action && action}
      </div>
      <IonCard className="card-details-info-block-inner">{children}</IonCard>
    </div>
  );
};

export { CardDetailsBlock };
