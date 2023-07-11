import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  ellipsisVertical,
  keyOutline,
  copyOutline,
  calendarNumberOutline,
  informationCircleOutline,
  personCircleOutline,
  trashOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import "./CredCardDetails.scss";
import { credsMock } from "../../__mocks__/credsMock";
import { CredCard } from "../../components/CardsStack";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getState, setCurrentRoute } from "../../../store/reducers/stateCache";
import { writeToClipboard } from "../../../utils/clipboard";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import { setCredsCache } from "../../../store/reducers/credsCache";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { CredsOptions } from "../../components/CredsOptions";

const CredCardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [creds, setCreds] = useState(credsMock);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState({
    id: params.id,
    type: [""],
    connection: "",
    issuanceDate: "",
    expirationDate: "",
    receivingDid: "",
    credentialType: "",
    nameOnCredential: "",
    issuerLogo: "",
    credentialSubject: {
      degree: {
        education: "",
        type: "",
        name: "",
      },
    },
    proofType: "",
    proofValue: "",
    credentialStatus: {
      revoked: false,
      suspended: false,
    },
    colors: ["", ""],
  });

  useEffect(() => {
    const cardDetails = creds.find((cred) => cred.id === params.id);
    if (cardDetails) setCardData(cardDetails);
  }, [params.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.CRED_DETAILS, {
      store: storeState,
    });
    updateReduxState(
      backPath.pathname,
      { store: storeState },
      dispatch,
      updateRedux
    );
    history.push(TabsRoutePath.CREDS);
  };

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update CredCardoptions file too.
    const updatedCreds = creds.filter((item) => item.id !== cardData.id);
    setCreds(updatedCreds);
    dispatch(setCredsCache(updatedCreds));
    handleDone();
  };

  const AdditionalButtons = () => {
    return (
      <>
        <IonButton
          shape="round"
          className="options-button"
          data-testid="options-button"
          onClick={() => {
            setOptionsIsOpen(true);
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
        title={`${i18n.t("creds.card.details.done")}`}
        titleSize="h3"
        titleAction={handleDone}
        menuButton={false}
        additionalButtons={<AdditionalButtons />}
      >
        {cardData.receivingDid.length === 0 ? (
          <div
            className="spinner-container"
            data-testid="spinner-container"
          >
            <IonSpinner name="dots" />
          </div>
        ) : (
          <>
            <CredCard
              cardData={cardData}
              isActive={false}
            />
            <div className="card-details-content">
              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.types")}</h3>
                <div className="card-details-info-block-inner">
                  {cardData.type.map((type: string, index: number) => (
                    <span
                      className="card-details-info-block-line"
                      key={index}
                    >
                      <span>
                        <IonIcon
                          slot="icon-only"
                          icon={informationCircleOutline}
                          color="primary"
                        />
                      </span>
                      <span className="card-details-info-block-data">
                        {cardData.type[index]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.attributes")}</h3>
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
                      {cardData.credentialSubject.degree.education}
                    </span>
                  </span>
                  <span className="card-details-info-block-line">
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={informationCircleOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {cardData.credentialSubject.degree.type}
                    </span>
                  </span>
                  <span className="card-details-info-block-line">
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={informationCircleOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {cardData.credentialSubject.degree.name}
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.connection")}</h3>
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
                      {cardData.connection}
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.issuancedate")}</h3>
                <div className="card-details-info-block-inner">
                  <span className="card-details-info-block-line">
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={calendarNumberOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {formatShortDate(cardData.issuanceDate)}
                      {" - "}
                      {formatTimeToSec(cardData.issuanceDate)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.expirationdate")}</h3>
                <div className="card-details-info-block-inner">
                  <span className="card-details-info-block-line">
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={calendarNumberOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {formatShortDate(cardData.expirationDate)}
                      {" - "}
                      {formatTimeToSec(cardData.expirationDate)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-details-info-block">
                <h3>{i18n.t("creds.card.details.prooftypes")}</h3>
                <div className="card-details-info-block-inner">
                  <span className="card-details-info-block-line">
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={informationCircleOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {cardData.proofType}
                    </span>
                  </span>
                  <span
                    className="card-details-info-block-line"
                    data-testid="copy-button-proof-value"
                    onClick={() => writeToClipboard(cardData.proofValue)}
                  >
                    <span>
                      <IonIcon
                        slot="icon-only"
                        icon={keyOutline}
                        color="primary"
                      />
                    </span>
                    <span className="card-details-info-block-data">
                      {cardData.proofValue.substring(0, 13)}...
                      {cardData.proofValue.slice(-5)}
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
                {i18n.t("creds.card.details.delete.button")}
              </IonButton>
            </div>
          </>
        )}
        <CredsOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          id={cardData.id}
        />
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          headerText={i18n.t("creds.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "creds.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "creds.card.details.delete.alert.cancel"
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

export { CredCardDetails };
