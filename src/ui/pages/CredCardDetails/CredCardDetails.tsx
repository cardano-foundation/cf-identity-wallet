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
import { CredCard } from "../../components/CardsStack";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { writeToClipboard } from "../../../utils/clipboard";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { CredsOptions } from "../../components/CredsOptions";
import {
  defaultCredentialsCardData,
  operationState,
  toastState,
} from "../../constants/dictionary";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { CredentialDetails } from "../../../core/agent/agent.types";
import { AriesAgent } from "../../../core/agent/agent";

const CredCardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<CredentialDetails>();

  useEffect(() => {
    async function getCredDetails() {
      const cardDetails =
        await AriesAgent.agent.credentials.getCredentialDetailsById(params.id);
      setCardData(cardDetails);
    }
    getCredDetails();
  }, [params.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.CRED_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push(backPath.pathname);
  };

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update CredCardoptions file too.
    // const updatedCreds = creds.filter((item) => item.id !== cardData.id);
    // setCreds(updatedCreds);
    // dispatch(setCredsCache(updatedCreds));
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
            color="secondary"
          />
        </IonButton>
      </>
    );
  };
  const formatDateTime = (date: string) => {
    return (
      <>
        {formatShortDate(date)}
        {" - "}
        {formatTimeToSec(date)}
      </>
    );
  };
  if (!cardData)
    return (
      <div
        className="spinner-container"
        data-testid="spinner-container"
      >
        <IonSpinner name="dots" />
      </div>
    );

  const credentialSubject = cardData.credentialSubject;
  // @TODO: handle when credentialSubject is an array
  if (Array.isArray(credentialSubject)) {
    return null;
  }
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

          {/*@TODO: handle attributes, credentialSubject, it can come in many formats*/}
          <div className="card-details-info-block">
            <h3>{i18n.t("creds.card.details.attributes")}</h3>
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
                  {credentialSubject.type as string}
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
                  {`${credentialSubject.name}`}
                </span>
              </span>
            </div>
          </div>

          {cardData.connectionId && (
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
                    {cardData.connectionId}
                  </span>
                </span>
              </div>
            </div>
          )}

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
                  {formatDateTime(cardData.issuanceDate)}
                </span>
              </span>
            </div>
          </div>

          {cardData.expirationDate && (
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
                    {formatDateTime(cardData.expirationDate)}
                  </span>
                </span>
              </div>
            </div>
          )}

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
                onClick={() => {
                  writeToClipboard(cardData.proofValue);
                  dispatch(setCurrentOperation(toastState.copiedToClipboard));
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
            onClick={() => {
              setAlertIsOpen(true);
              dispatch(setCurrentOperation(operationState.deleteCredential));
            }}
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
        <CredsOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          id={params.id}
        />
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-delete"
          headerText={i18n.t("creds.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "creds.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "creds.card.details.delete.alert.cancel"
          )}`}
          actionConfirm={() => {
            if (
              !stateCache?.authentication.passwordIsSkipped &&
              stateCache?.authentication.passwordIsSet
            ) {
              setVerifyPasswordIsOpen(true);
            } else {
              setVerifyPasscodeIsOpen(true);
            }
          }}
          actionCancel={() => dispatch(setCurrentOperation(""))}
          actionDismiss={() => dispatch(setCurrentOperation(""))}
        />
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={handleDelete}
        />
        <VerifyPasscode
          isOpen={verifyPasscodeIsOpen}
          setIsOpen={setVerifyPasscodeIsOpen}
          onVerify={handleDelete}
        />
      </TabLayout>
    </IonPage>
  );
};

export { CredCardDetails };
