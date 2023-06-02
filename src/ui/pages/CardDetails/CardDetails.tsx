import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { IonButton, IonIcon, IonPage } from "@ionic/react";
import {
  shareOutline,
  ellipsisVertical,
  keyOutline,
  copyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
  trashOutline,
} from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { i18n } from "../../../i18n";
import { CardsStack } from "../../components/CardsStack";
import { RootState } from "../../../store";
import { clearCardInfoCache } from "../../../store/reducers/cardInfoCache";
import "./CardDetails.scss";

const AdditionalButtons = () => {
  return (
    <>
      <IonButton
        shape="round"
        className="contacts-button"
        data-testid="contacts-button"
      >
        <IonIcon
          slot="icon-only"
          icon={shareOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
      >
        <IonIcon
          slot="icon-only"
          icon={ellipsisVertical}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const CardDetails = () => {
  const history = useHistory();
  const cardProps = useSelector(
    (state: RootState) => state.cardInfoCache.cardProps
  );
  const cardData = useSelector(
    (state: RootState) => state.cardInfoCache.cardData
  );
  let donePath = "";

  switch (cardProps.cardType) {
    case "dids":
      donePath = TabsRoutePath.DIDS;
      break;

    default:
      "/";
      break;
  }

  return (
    <IonPage className="tab-layout card-details">
      <TabLayout
        header={true}
        title={`${i18n.t("card.details.done")}`}
        titleSize="h3"
        titleAction={() => {
          clearCardInfoCache();
          history.replace(donePath);
        }}
        menuButton={false}
        additionalButtons={<AdditionalButtons />}
      >
        <CardsStack
          cardsType={cardProps.cardType}
          cardsData={cardData}
        />
        {cardProps.cardType === "dids" && (
          <div className="card-details-content">
            <div className="card-details-info-block">
              <h3>{i18n.t("dids.card.details.information")}</h3>
              <div className="card-details-info-block-inner">
                <span className="card-details-info-block-line">
                  <span>
                    <IonIcon
                      slot="icon-only"
                      icon={keyOutline}
                      color="primary"
                    />
                  </span>

                  <span className="card-details-info-block-data">
                    {cardData[0].id.substring(0, 13)}...
                    {cardData[0].id.slice(-5)}
                  </span>
                  <span>
                    <IonButton
                      shape="round"
                      className="copy-button"
                      data-testid="copy-button"
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
                    {cardData[0].date}
                  </span>
                </span>
              </div>
            </div>
            <div className="card-details-info-block">
              <h3>{i18n.t("dids.card.details.type")}</h3>
              <div className="card-details-info-block-inner">
                <span className="card-details-info-block-line">
                  <span>
                    <IonIcon
                      slot="icon-only"
                      icon={pricetagOutline}
                      color="primary"
                    />
                  </span>

                  <span className="card-details-info-block-data">
                    {cardData[0].keyType}
                  </span>
                  <span>
                    <IonButton
                      shape="round"
                      className="copy-button"
                      data-testid="copy-button"
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
                <span className="card-details-info-block-line">
                  <span>
                    <IonIcon
                      slot="icon-only"
                      icon={personCircleOutline}
                      color="primary"
                    />
                  </span>

                  <span className="card-details-info-block-data">
                    {cardData[0].controller.substring(0, 13)}...
                    {cardData[0].controller.slice(-5)}
                  </span>
                  <span>
                    <IonButton
                      shape="round"
                      className="copy-button"
                      data-testid="copy-button"
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
                <span className="card-details-info-block-line">
                  <span>
                    <IonIcon
                      slot="icon-only"
                      icon={keyOutline}
                      color="primary"
                    />
                  </span>

                  <span className="card-details-info-block-data">
                    {cardData[0].publicKeyBase58.substring(0, 5)}...
                    {cardData[0].publicKeyBase58.slice(-5)}
                  </span>
                  <span>
                    <IonButton
                      shape="round"
                      className="copy-button"
                      data-testid="copy-button"
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
            <IonButton
              shape="round"
              expand="block"
              color="danger"
              className="delete-button"
            >
              <IonIcon
                slot="icon-only"
                size="small"
                icon={trashOutline}
                color="primary"
              />
              {i18n.t("dids.card.details.delete")}
            </IonButton>
          </div>
        )}
      </TabLayout>
    </IonPage>
  );
};

export { CardDetails, AdditionalButtons };
