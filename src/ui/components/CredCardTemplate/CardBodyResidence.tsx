import { CredentialDetails } from "../../../core/agent/agent.types";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";

// @TODO - sdisalvo: cardData should be of type CredentialDetails
const CardBodyResidency = ({ cardData }: any) => {
  const credentialSubject = cardData.credentialSubject;
  console.log(credentialSubject);
  return (
    <>
      <div className="card-body">
        <div className="left-column">
          <img
            src={credentialSubject.image}
            alt="us-immigration-background"
          />
        </div>
        <div className="center-column">
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.name")}
            </span>
            <span className="card-body-info-value">
              {credentialSubject.givenName + " " + credentialSubject.familyName}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.countryofbirth")}
            </span>
            <span className="card-body-info-value">
              {credentialSubject.birthCountry}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.expirationdate")}
            </span>
            <span className="card-body-info-value">
              {formatShortDate(cardData.expirationDate)}
            </span>
          </div>
        </div>
        <div className="right-column">
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.category")}
            </span>
            <span className="card-body-info-value">
              {credentialSubject.lprCategory}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.residentsince")}
            </span>
            <span className="card-body-info-value">
              {formatShortDate(credentialSubject.residentSince)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardBodyResidency;
