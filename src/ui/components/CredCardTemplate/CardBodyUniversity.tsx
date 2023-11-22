import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";

// @TODO - sdisalvo: cardData should be of type CredentialDetails
const CardBodyUniversity = ({ cardData }: any) => {
  return (
    <>
      <div className="card-body">
        <span>
          <>&nbsp;</>
        </span>
      </div>
      <div className="card-footer">
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.type")}
          </span>
          <span className="card-footer-column-value">
            {cardData.cachedDetails?.degreeType
              ?.replace(/([A-Z][a-z])/g, " $1")
              .replace(/(\d)/g, " $1")}
          </span>
        </div>
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.issued")}
          </span>
          <span className="card-footer-column-value">
            {formatShortDate(cardData.issuanceDate)}
          </span>
        </div>
      </div>
    </>
  );
};

export default CardBodyUniversity;
