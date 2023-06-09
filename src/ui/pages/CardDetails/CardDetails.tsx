import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
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
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import "./CardDetails.scss";
import { didsMock } from "../../__mocks__/didsMock";
import { DidCard } from "../../components/CardsStack";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getState, setCurrentRoute } from "../../../store/reducers/stateCache";

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
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState({
    id: params.id,
    type: "",
    name: "",
    date: "",
    colors: ["", ""],
    keyType: "",
    controller: "",
    publicKeyBase58: "",
  });

  useEffect(() => {
    const cardDetails = didsMock.find((did) => did.id === params.id);
    if (cardDetails) setCardData(cardDetails);
  }, [params?.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const onClickDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.DID_DETAILS, {
      store: storeState,
    });
    updateReduxState(
      backPath.pathname,
      { store: storeState },
      dispatch,
      updateRedux
    );
    history.push(TabsRoutePath.DIDS);
  };
  return (
    <IonPage className="tab-layout card-details">
      <TabLayout
        header={true}
        title={`${i18n.t("card.details.done")}`}
        titleSize="h3"
        titleAction={() => onClickDone()}
        menuButton={false}
        additionalButtons={<AdditionalButtons />}
      >
        {cardData.name.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <IonSpinner name="dots" />
          </div>
        ) : (
          <>
            <DidCard
              cardData={cardData}
              isActive={false}
              onHandleShowCardDetails={() => {}}
            />
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
                      {cardData?.id.substring(0, 13)}...
                      {cardData?.id.slice(-5)}
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
                      {cardData?.date}
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
                      {cardData?.keyType}
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
                      {cardData?.controller.substring(0, 13)}...
                      {cardData?.controller.slice(-5)}
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
                      {cardData?.publicKeyBase58.substring(0, 5)}...
                      {cardData?.publicKeyBase58.slice(-5)}
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
          </>
        )}
      </TabLayout>
    </IonPage>
  );
};

export { CardDetails, AdditionalButtons };
