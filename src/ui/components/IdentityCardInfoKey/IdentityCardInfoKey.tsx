import { IonButton, IonIcon } from "@ionic/react";
import {
  keyOutline,
  copyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { writeToClipboard } from "../../../utils/clipboard";
import { formatShortDate } from "../../../utils";
import { IdentityCardInfoKeyProps } from "./IdentityCardInfoKey.types";

const IdentityCardInfoKey = ({
  cardData,
  setShowToast,
}: IdentityCardInfoKeyProps) => {
  return (
    <>
      <div className="card-details-info-block">
        <h3>{i18n.t("dids.card.details.information")}</h3>
        <div className="card-details-info-block-inner">
          <span
            className="card-details-info-block-line"
            data-testid="copy-button-id"
            onClick={() => {
              writeToClipboard(cardData.id);
              setShowToast(true);
            }}
          >
            <span>
              <IonIcon
                slot="icon-only"
                icon={keyOutline}
                color="primary"
              />
            </span>

            <span className="card-details-info-block-data">
              {cardData.id.substring(0, 13)}...
              {cardData.id.slice(-5)}
            </span>
            <span>
              <IonButton
                shape="round"
                className="copy-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
          </span>
          <span className="card-details-info-block-line">
            <span>
              <IonIcon
                slot="icon-only"
                icon={calendarNumberOutline}
                color="primary"
              />
            </span>

            <span className="card-details-info-block-data">
              {formatShortDate(cardData?.createdAtUTC)}
            </span>
          </span>
        </div>
      </div>
      <div className="card-details-info-block">
        <h3>{i18n.t("dids.card.details.type")}</h3>
        <div className="card-details-info-block-inner">
          <span
            className="card-details-info-block-line"
            data-testid="copy-button-type"
            onClick={() => {
              writeToClipboard(cardData.keyType);
              setShowToast(true);
            }}
          >
            <span>
              <IonIcon
                slot="icon-only"
                icon={pricetagOutline}
                color="primary"
              />
            </span>

            <span className="card-details-info-block-data">
              {cardData.keyType}
            </span>
            <span>
              <IonButton
                shape="round"
                className="copy-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
          </span>
        </div>
      </div>
      <div className="card-details-info-block">
        <h3>{i18n.t("dids.card.details.controller")}</h3>
        <div className="card-details-info-block-inner">
          <span
            className="card-details-info-block-line"
            data-testid="copy-button-controller"
            onClick={() => {
              writeToClipboard(cardData.controller);
              setShowToast(true);
            }}
          >
            <span>
              <IonIcon
                slot="icon-only"
                icon={personCircleOutline}
                color="primary"
              />
            </span>

            <span className="card-details-info-block-data">
              {cardData.controller.substring(0, 13)}...
              {cardData.controller.slice(-5)}
            </span>
            <span>
              <IonButton
                shape="round"
                className="copy-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
          </span>
        </div>
      </div>
      <div className="card-details-info-block">
        <h3>{i18n.t("dids.card.details.publickeybase")}</h3>
        <div className="card-details-info-block-inner">
          <span
            className="card-details-info-block-line"
            data-testid="copy-button-publicKeyBase58"
            onClick={() => {
              writeToClipboard(cardData.publicKeyBase58);
              setShowToast(true);
            }}
          >
            <span>
              <IonIcon
                slot="icon-only"
                icon={keyOutline}
                color="primary"
              />
            </span>
            <span className="card-details-info-block-data">
              {cardData.publicKeyBase58.substring(0, 5)}...
              {cardData.publicKeyBase58.slice(-5)}
            </span>
            <span>
              <IonButton
                shape="round"
                className="copy-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export { IdentityCardInfoKey };
