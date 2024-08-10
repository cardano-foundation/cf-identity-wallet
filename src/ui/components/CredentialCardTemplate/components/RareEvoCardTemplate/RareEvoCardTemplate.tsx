import { useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../../../Alert";
import { CredentialCardTemplateProps } from "../../CredentialCardTemplate.types";
import { i18n } from "../../../../../i18n";
import ACDCLogo from "../../../../../ui/assets/images/keri-acdc.svg";
import RareEvoBackground from "../../../../../ui/assets/images/rare-evo-bg.jpg";
import "./RareEvoCardTemplate.scss";
import { formatShortDate } from "../../../../utils/formatters";
import { CredentialStatus } from "../../../../../core/agent/services/credentialService.types";

const RareEvoCardTemplate = ({
  name = "default",
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
  pickedCard,
}: CredentialCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const CredentialCardTemplateStyles = {
    zIndex: index,
    backgroundImage: `url(${RareEvoBackground})`,
    backgroundSize: "cover",
  };

  const handleCardClick = () => {
    if (cardData.status === CredentialStatus.PENDING) {
      setAlertIsOpen(true);
    } else if (onHandleShowCardDetails) {
      onHandleShowCardDetails(index);
    }
  };

  return (
    <div
      key={index}
      data-testid={`rare-card-template${
        index !== undefined ? `-${name}-index-${index}` : ""
      }`}
      className={`rare-card-template ${isActive ? "active" : ""} ${
        pickedCard ? "picked-card" : "not-picked"
      }`}
      onClick={() => handleCardClick()}
      style={CredentialCardTemplateStyles}
    >
      <div className={`rare-card-template-inner ${cardData.status}`}>
        <div className="card-header">
          <span className="card-logo">
            <img
              src={ACDCLogo}
              alt="card-logo"
            />
          </span>
          {cardData.status === CredentialStatus.PENDING ? (
            <IonChip>
              <IonIcon
                icon={hourglassOutline}
                color="primary"
              />
              <span>{CredentialStatus.PENDING}</span>
            </IonChip>
          ) : (
            <span className="credential-type">{cardData.credentialType}</span>
          )}
        </div>
        <div className="card-footer">
          <div className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("credentials.layout.issued")}
            </span>
            <span className="card-footer-column-value">
              {cardData.status === CredentialStatus.CONFIRMED ? (
                formatShortDate(cardData.issuanceDate)
              ) : (
                <>&nbsp;</>
              )}
            </span>
          </div>
        </div>
      </div>
      {cardData.status === CredentialStatus.PENDING && alertIsOpen && (
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-confirm"
          headerText={i18n.t("credentials.create.alert.title")}
          confirmButtonText={`${i18n.t("credentials.create.alert.confirm")}`}
          actionConfirm={() => setAlertIsOpen(false)}
          backdropDismiss={false}
        />
      )}
    </div>
  );
};

export { RareEvoCardTemplate };
