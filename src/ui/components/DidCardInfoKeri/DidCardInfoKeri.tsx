/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IonButton, IonIcon } from "@ionic/react";
import {
  copyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { writeToClipboard } from "../../../utils/clipboard";
import { formatShortDate } from "../../../utils";
import { DidCardInfoKeriProps } from "./DidCardInfoKeri.types";

interface TempKeriProps {
  cardData: {
    delegatorIdentifier: string;
    signingKeysList: string[];
    signingKeysThreshold: string;
    nextKeysList: string[];
    nextKeysThreshold: string;
    creationTimestamp: string;
    rotationTimestamp: string;
    sequenceNumber: string;
    backersList: string;
    backerAddress: string;
  };
  setShowToast: (value: boolean) => void;
}

const DidCardInfoKeri = ({ cardData, setShowToast }: TempKeriProps) => {
  return (
    <>
      {cardData.delegatorIdentifier.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.delegator")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="delegator-copy-button"
              onClick={() => {
                writeToClipboard(cardData.delegatorIdentifier);
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
                {cardData.delegatorIdentifier}
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
      )}
      {cardData.signingKeysList.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.signingkeyslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.signingKeysList.map((item, index) => {
              return (
                <span
                  className="card-details-info-block-line"
                  data-testid={`signing-keys-list-copy-button-${index}`}
                  key={index}
                  onClick={() => {
                    writeToClipboard(item);
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

                  <span className="card-details-info-block-data">{item}</span>
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
              );
            })}
          </div>
        </div>
      )}
      {cardData.signingKeysThreshold.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.signingkeysthreshold")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="signing-keys-threshold"
            >
              <span>
                <IonIcon
                  slot="icon-only"
                  icon={pricetagOutline}
                  color="primary"
                />
              </span>

              <span className="card-details-info-block-data">
                {cardData.signingKeysThreshold}
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
      )}
      {cardData.nextKeysList.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.nextkeyslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.nextKeysList.map((item, index) => {
              return (
                <span
                  className="card-details-info-block-line"
                  data-testid={`next-keys-list-copy-button-${index}`}
                  key={index}
                  onClick={() => {
                    writeToClipboard(item);
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

                  <span className="card-details-info-block-data">{item}</span>
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
              );
            })}
          </div>
        </div>
      )}
      {cardData.nextKeysThreshold.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.nextkeysthreshold")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="next-keys-threshold"
            >
              <span>
                <IonIcon
                  slot="icon-only"
                  icon={pricetagOutline}
                  color="primary"
                />
              </span>

              <span className="card-details-info-block-data">
                {cardData.nextKeysThreshold}
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
      )}
      {cardData.creationTimestamp.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.creationtimestamp")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="creation-timestamp"
            >
              <span>
                <IonIcon
                  slot="icon-only"
                  icon={calendarNumberOutline}
                  color="primary"
                />
              </span>

              <span className="card-details-info-block-data">
                {formatShortDate(cardData.creationTimestamp)}
              </span>
            </span>
          </div>
        </div>
      )}
      {cardData.rotationTimestamp.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.rotationtimestamp")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="rotation-timestamp"
            >
              <span>
                <IonIcon
                  slot="icon-only"
                  icon={calendarNumberOutline}
                  color="primary"
                />
              </span>

              <span className="card-details-info-block-data">
                {formatShortDate(cardData.rotationTimestamp)}
              </span>
            </span>
          </div>
        </div>
      )}
      {cardData.sequenceNumber.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.sequencenumber")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="sequence-number"
              onClick={() => {
                writeToClipboard(cardData.sequenceNumber);
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
                {cardData.sequenceNumber}
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
      )}
      {cardData.backersList.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.backerslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.backersList.map((item, index) => {
              return (
                <span
                  className="card-details-info-block-line"
                  data-testid={`backers-list-copy-button-${index}`}
                  key={index}
                  onClick={() => {
                    writeToClipboard(item);
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

                  <span className="card-details-info-block-data">{item}</span>
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
              );
            })}
          </div>
        </div>
      )}
      {cardData.backerAddress.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.backeraddress")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="copy-button-backer-address"
              onClick={() => {
                writeToClipboard(cardData.backerAddress);
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
                {cardData.backerAddress}
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
      )}
    </>
  );
};

export { DidCardInfoKeri };
