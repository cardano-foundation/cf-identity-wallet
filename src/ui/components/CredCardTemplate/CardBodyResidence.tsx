import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";
import imagePlaceholder from "../../assets/images/user-image-placeholder.svg";

// @TODO - sdisalvo: cardData should be of type CredentialDetails
const CardBodyResidency = ({ cardData }: any) => {
  return (
    <>
      <div className="card-body">
        <div className="left-column">
          <img
            src={cardData.cachedDetails?.image}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // @TODO - sdisalvo: Handle error
              currentTarget.src = imagePlaceholder;
            }}
            alt="user-picture"
          />
        </div>
        <div className="center-column">
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.name")}
            </span>
            <span className="card-body-info-value">
              {cardData.cachedDetails?.givenName +
                " " +
                cardData.cachedDetails?.familyName}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.countryofbirth")}
            </span>
            <span className="card-body-info-value">
              {cardData.cachedDetails?.birthCountry}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.expirationdate")}
            </span>
            <span className="card-body-info-value">
              {formatShortDate(cardData.cachedDetails?.expirationDate)}
            </span>
          </div>
        </div>
        <div className="right-column">
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.category")}
            </span>
            <span className="card-body-info-value">
              {cardData.cachedDetails?.lprCategory}
            </span>
          </div>
          <div className="card-body-info">
            <span className="card-body-info-label">
              {i18n.t("creds.card.layout.residentsince")}
            </span>
            <span className="card-body-info-value">
              {formatShortDate(cardData.cachedDetails?.residentSince)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardBodyResidency;
