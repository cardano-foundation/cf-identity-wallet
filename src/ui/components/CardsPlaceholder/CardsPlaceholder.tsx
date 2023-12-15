import { addOutline } from "ionicons/icons";
import { CardsPlaceholderProps } from "./CardsPlaceholder.types";
import "./CardsPlaceholder.scss";
import { PageFooter } from "../PageFooter";

const CardsPlaceholder = ({
  buttonLabel,
  buttonAction,
  testId,
}: CardsPlaceholderProps) => {
  const pageId = "cards-placeholder";
  return (
    <div
      className="cards-placeholder-container"
      data-testid={testId}
    >
      <div className="cards-placeholder-cards">
        <span className="back-card" />
        <span className="front-card" />
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonIcon={addOutline}
        primaryButtonText={buttonLabel}
        primaryButtonAction={() => {
          buttonAction;
        }}
      />
    </div>
  );
};

export { CardsPlaceholder };
