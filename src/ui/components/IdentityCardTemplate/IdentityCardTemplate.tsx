import { IdentifierType } from "../../../core/agent/agent.types";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";
import { IDENTIFIER_BG_MAPPING } from "../../globals/types";
import { IdentityCardTemplateProps } from "./IdentityCardTemplate.types";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";
import KERILogo from "../../../ui/assets/images/keri-logo.svg";
import "./IdentityCardTemplate.scss";

const IdentityCardTemplate = ({
  name = "default",
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
}: IdentityCardTemplateProps) => {
  const divStyle = {
    backgroundImage: `url(${IDENTIFIER_BG_MAPPING[cardData.theme]})`,
    backgroundSize: "cover",
    zIndex: index,
  };

  return (
    <div
      key={index}
      data-testid={`identity-card-template-${
        index !== undefined ? `${name}-index-${index}` : ""
      }`}
      className={`identity-card-template ${isActive ? "active" : ""}`}
      onClick={() => {
        if (onHandleShowCardDetails) {
          onHandleShowCardDetails(index);
        }
      }}
      style={divStyle}
    >
      <div className="identity-card-template-inner">
        <div className="card-header">
          <span className="card-logo">
            <img
              src={cardData.method === IdentifierType.KEY ? W3CLogo : KERILogo}
              alt="card-logo"
            />
            {cardData.method === IdentifierType.KEY ? "did:key" : ""}
          </span>
          <span>{cardData.displayName}</span>
        </div>
        <div className="card-body">
          <span>{""}</span>
        </div>
        <div className="card-footer">
          <span className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("identity.card.layout.created")}
            </span>
            <span className="card-footer-column-info">
              {formatShortDate(cardData.createdAtUTC)}
            </span>
          </span>
          <span className="card-footer-column">
            <span className="card-footer-column-info">
              {cardData.method === IdentifierType.KEY
                ? cardData.id.substring(8, 13) + "..." + cardData.id.slice(-5)
                : cardData.id.substring(0, 5) + "..." + cardData.id.slice(-5)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export { IdentityCardTemplate };
