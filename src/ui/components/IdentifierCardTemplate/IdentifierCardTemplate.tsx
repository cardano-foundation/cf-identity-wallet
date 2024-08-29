import { i18n } from "../../../i18n";
import KERILogo from "../../../ui/assets/images/keri-aid.svg";
import { IDENTIFIER_BG_MAPPING } from "../../globals/types";
import { formatShortDate } from "../../utils/formatters";
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
    backgroundImage: `url(${IDENTIFIER_BG_MAPPING[cardData.theme]})`,
    backgroundSize: "cover",
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
          <span data-testid={`card-display-name-${index}`}>
            {cardData.displayName}
          </span>
        </div>
        <div className="card-body">
          <span>{""}</span>
        </div>
        <div className="card-footer">
          <span className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("identifiers.layout.created")}
            </span>
            <span
              className="card-footer-column-info"
              data-testid={`card-created-${index}`}
            >
              {formatShortDate(cardData.createdAtUTC)}
            </span>
          </span>
          <span className="card-footer-column">
            <span className="card-footer-column-info">
              {cardData.id.substring(0, 5) + "..." + cardData.id.slice(-5)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export { IdentifierCardTemplate };
