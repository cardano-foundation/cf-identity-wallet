import { i18n } from "../../../i18n";
import KERILogo from "../../../ui/assets/images/keri-aid.png";
import { formatShortDate } from "../../utils/formatters";
import { getTheme } from "../../utils/theme";
import { CardTheme } from "../CardTheme";
import "./IdentifierCardTemplate.scss";
import { IdentifierCardTemplateProps } from "./IdentifierCardTemplate.types";
import { useCardOffsetTop } from "./cardOffsetTopHook";

const IdentifierCardTemplate = ({
  name = "default",
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
  pickedCard,
}: IdentifierCardTemplateProps) => {
  const { getCardOffsetTop, cardRef } = useCardOffsetTop();

  const identifierCardTemplateStyles = {
    zIndex: index,
    transform: pickedCard
      ? `translateY(${-getCardOffsetTop() * index}px)`
      : undefined,
  };

  const handleCardClick = () => {
    if (onHandleShowCardDetails) {
      onHandleShowCardDetails(index);
    }
  };

  return (
    <div
      ref={cardRef}
      key={index}
      data-testid={`identifier-card-template${
        index !== undefined ? `-${name}-index-${index}` : ""
      }`}
      className={`identifier-card-template ${isActive ? "active" : ""} ${
        pickedCard ? "picked-card" : "not-picked"
      }`}
      onClick={() => handleCardClick()}
      style={identifierCardTemplateStyles}
    >
      <div className="big-card-theme">
        <CardTheme {...getTheme(cardData.theme)} />
      </div>
      <div className="identifier-card-template-inner">
        <div className="card-header">
          <span
            className="card-logo"
            data-testid={`card-key-${index}`}
          >
            <img
              src={KERILogo}
              alt="card-logo"
            />
          </span>
          <span
            className="card-text"
            data-testid={`card-display-name-${index}`}
          >
            {cardData.displayName}
          </span>
        </div>
        <div className="card-body">
          <span>{""}</span>
        </div>
        <div className="card-footer">
          <span className="card-footer-column">
            <span className="card-footer-column-label card-text">
              {i18n.t("tabs.identifiers.layout.created")}
            </span>
            <span
              className="card-footer-column-info card-text time"
              data-testid={`card-created-${index}`}
            >
              {formatShortDate(cardData.createdAtUTC)}
            </span>
          </span>
          <span className="card-footer-column">
            <span className="card-footer-column-info card-text">
              {cardData.id.substring(0, 5) + "..." + cardData.id.slice(-5)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export { IdentifierCardTemplate };
