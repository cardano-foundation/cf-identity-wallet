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
import { writeToClipboard } from "../../../utils/clipboard";
import { ShareIdentity } from "../../components/ShareIdentity";
import { EditIdentity } from "../../components/EditIdentity";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import { setDidsCache } from "../../../store/reducers/didsCache";

const CardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [dids, setDids] = useState(didsMock);
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
    const cardDetails = dids.find((did) => did.id === params.id);
    if (cardDetails) setCardData(cardDetails);
  }, [params?.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
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

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update EditIdentity file too.
    const updatedDids = dids.filter((item) => item.id !== cardData.id);
    setDids(updatedDids);
    dispatch(setDidsCache(updatedDids));
    handleDone();
  };

  const AdditionalButtons = () => {
    return (
      <>
        <IonButton
          shape="round"
          className="share-button"
          data-testid="share-button"
          onClick={() => {
            setShareIsOpen(true);
          }}
        >
          <IonIcon
            slot="icon-only"
            icon={shareOutline}
            color="primary"
          />
        </IonButton>
        <IonButton
          shape="round"
          className="edit-button"
          data-testid="edit-button"
          onClick={() => {
            setEditIsOpen(true);
          }}
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

  return (
    <IonPage className="tab-layout card-details">
      <TabLayout
        header={true}
        title={`${i18n.t("carddetails.done")}`}
        titleSize="h3"
        titleAction={handleDone}
        menuButton={false}
        additionalButtons={<AdditionalButtons />}
      >
        {cardData.name.length === 0 ? (
          <div
            className="spinner-container"
            data-testid="spinner-container"
          >
            <IonSpinner name="dots" />
          </div>
        ) : (
          <>
            <DidCard
              cardData={cardData}
              isActive={false}
            />
            <div className="card-details-content">
              <div className="card-details-info-block">
                <h3>{i18n.t("dids.card.details.information")}</h3>
                <div className="card-details-info-block-inner">
                  <span
                    className="card-details-info-block-line"
                    data-testid="copy-button-id"
                    onClick={() => writeToClipboard(cardData.id)}
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
                      {cardData?.date}
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
                    onClick={() => writeToClipboard(cardData.keyType)}
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
                    onClick={() => writeToClipboard(cardData.controller)}
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
                    onClick={() => writeToClipboard(cardData.publicKeyBase58)}
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
              <IonButton
                shape="round"
                expand="block"
                color="danger"
                data-testid="card-details-delete-button"
                className="delete-button"
                onClick={() => setAlertIsOpen(true)}
              >
                <IonIcon
                  slot="icon-only"
                  size="small"
                  icon={trashOutline}
                  color="primary"
                />
                {i18n.t("dids.card.details.delete.button")}
              </IonButton>
            </div>
          </>
        )}
        <ShareIdentity
          isOpen={shareIsOpen}
          setIsOpen={setShareIsOpen}
          id={cardData.id}
          name={cardData.name}
        />
        <EditIdentity
          isOpen={editIsOpen}
          setIsOpen={setEditIsOpen}
          id={cardData.id}
          name={cardData.name}
        />
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          headerText={i18n.t("dids.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "dids.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "dids.card.details.delete.alert.cancel"
          )}`}
          actionConfirm={() => setVerifyPasswordIsOpen(true)}
        />
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={handleDelete}
        />
      </TabLayout>
    </IonPage>
  );
};

export { CardDetails };
