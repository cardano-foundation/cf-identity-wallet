import { addOutline } from "ionicons/icons";
import { CardsPlaceholderProps } from "./CardsPlaceholder.types";
import "./CardsPlaceholder.scss";
import { PageFooter } from "../PageFooter";

const CardsPlaceholder = ({
  buttonLabel,
  buttonAction,
  testId,
  children,
}: CardsPlaceholderProps) => {
  return (
    <div
      className="cards-placeholder-container"
      data-testid={`${testId}-cards-placeholder`}
    >
      <div className="cards-placeholder-cards">
        <span className="back-card" />
        <span className="front-card" />
      </div>
      {buttonLabel && buttonAction && (
        <PageFooter
          pageId={testId}
          primaryButtonIcon={addOutline}
          primaryButtonText={buttonLabel}
          primaryButtonAction={buttonAction}
        />
      )}
      {children}
    </div>
  );
};

export { CardsPlaceholder };
