import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { useState } from "react";
import { CredentialStatus } from "../../../../../core/agent/services/credentialService.types";
import { i18n } from "../../../../../i18n";
import KeriBackground from "../../../../../ui/assets/images/keri-00.svg";
import ACDCLogo from "../../../../../ui/assets/images/keri-acdc.svg";
import { formatShortDate } from "../../../../utils/formatters";
import { Alert } from "../../../Alert";
import { useCardOffsetTop } from "../../../IdentifierCardTemplate";
import { CredentialCardTemplateProps } from "../../CredentialCardTemplate.types";
import "./KeriCardTemplate.scss";

const KeriCardTemplate = ({
  name = "default",
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
  pickedCard,
}: CredentialCardTemplateProps) => {
  const { getCardOffsetTop, cardRef } = useCardOffsetTop();

  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const CredentialCardTemplateStyles = {
    zIndex: index,
    backgroundImage: `url(${KeriBackground})`,
    backgroundSize: "cover",
    transform: pickedCard
      ? `translateY(${-getCardOffsetTop() * index}px)`
      : undefined,
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
      ref={cardRef}
      key={index}
      data-testid={`keri-card-template${
        index !== undefined ? `-${name}-index-${index}` : ""
      }`}
      className={`keri-card-template ${isActive ? "active" : ""} ${
        pickedCard ? "picked-card" : "not-picked"
      }`}
      onClick={() => handleCardClick()}
      style={CredentialCardTemplateStyles}
    >
      <div className={`keri-card-template-inner ${cardData.status}`}>
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

export { KeriCardTemplate };
