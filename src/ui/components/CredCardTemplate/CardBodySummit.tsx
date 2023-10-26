import { CredentialDetails } from "../../../core/agent/agent.types";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";

// @TODO - sdisalvo: cardData should be of type CredentialDetails
const CardBodySummit = ({ cardData }: any) => {
  const credentialSubject = cardData.credentialSubject;
  return (
    <>
      <div className="card-body">
        <div className="left-column">
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.type")}
            </span>
            <span className="card-body-info-value">
              {credentialSubject.type}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.validity")}
            </span>
            <span className="card-body-info-value">
              {formatShortDate(credentialSubject.startDate) +
                " - " +
                formatShortDate(credentialSubject.endDate)}
            </span>
          </div>
        </div>
        <div className="right-column"></div>
      </div>
    </>
  );
};

export default CardBodySummit;
