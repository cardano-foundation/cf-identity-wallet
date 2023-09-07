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
import { IdentityCardInfoKeriProps } from "./IdentityCardInfoKeri.types";
import { SignifyApi } from "../../../core/aries/modules/signify/signifyApi";

const IdentityCardInfoKeri = ({
  cardData,
  setShowToast,
}: IdentityCardInfoKeriProps) => {
  return (
    <>
      {cardData.di !== "" && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.delegator")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="delegator-copy-button"
              onClick={() => {
                writeToClipboard(cardData.di);
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
                {cardData.di}
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
      {cardData.k.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.signingkeyslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.k.map((item, index) => {
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
      {cardData.kt > 1 && (
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
                {cardData.kt}
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
      {cardData.n.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.nextkeyslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.n.map((item, index) => {
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
      {cardData.nt > 1 && (
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
                {cardData.nt}
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
              {formatShortDate(cardData.createdAtUTC)}
            </span>
          </span>
        </div>
      </div>
      {cardData.s > 0 && cardData.dt && (
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
                {formatShortDate(cardData.dt)}
              </span>
            </span>
          </div>
        </div>
      )}
      {cardData.s > 0 && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.sequencenumber")}</h3>
          <div className="card-details-info-block-inner">
            <span
              className="card-details-info-block-line"
              data-testid="sequence-number"
            >
              <span>
                <IonIcon
                  slot="icon-only"
                  icon={pricetagOutline}
                  color="primary"
                />
              </span>

              <span className="card-details-info-block-data">{cardData.s}</span>
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
      {cardData.b.length && (
        <div className="card-details-info-block">
          <h3>{i18n.t("dids.card.details.backerslist")}</h3>
          <div className="card-details-info-block-inner">
            {cardData.b.map((item, index) => {
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
      <div className="card-details-info-block">
        <h3>{i18n.t("dids.card.details.backeraddress")}</h3>
        <div className="card-details-info-block-inner">
          <span
            className="card-details-info-block-line"
            data-testid="copy-button-backer-address"
            onClick={() => {
              // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
              writeToClipboard(SignifyApi.BACKER_ADDRESS);
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
              {SignifyApi.BACKER_ADDRESS}
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

export { IdentityCardInfoKeri };
