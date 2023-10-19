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
  archiveOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { JsonObject } from "@aries-framework/core";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import { CredCard } from "../../components/CardsStack";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { writeToClipboard } from "../../../utils/clipboard";
import { VerifyPassword } from "../../components/VerifyPassword";
import {
  Alert as AlertDeleteArchive,
  Alert as AlertRestore,
} from "../../components/Alert";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { CredsOptions } from "../../components/CredsOptions";
import { operationState, toastState } from "../../constants/dictionary";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { CredentialDetails } from "../../../core/agent/agent.types";
import { AriesAgent } from "../../../core/agent/agent";
import {
  getCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import { getNextRoute } from "../../../routes/nextRoute";

const CredCardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const stateCache = useAppSelector(getStateCache);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteArchiveIsOpen, setAlertDeleteArchiveIsOpen] =
    useState(false);
  const [alertRestoreIsOpen, setAlertRestoreIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<CredentialDetails>();
  const isArchived =
    credsCache.filter((item) => item.id === params.id).length === 0;

  useEffect(() => {
    getCredDetails();
  }, [params.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const getCredDetails = async () => {
    const cardDetails =
      await AriesAgent.agent.credentials.getCredentialDetailsById(params.id);
    setCardData(cardDetails);
  };

  const handleDone = () => {
    const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.CRED_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      nextPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push(nextPath.pathname);
  };

  const handleArchiveCredential = async () => {
    setVerifyPasswordIsOpen(false);
    setVerifyPasscodeIsOpen(false);
    await AriesAgent.agent.credentials.archiveCredential(params.id);
    const creds = credsCache.filter((item) => item.id !== params.id);
    dispatch(setCredsCache(creds));
    dispatch(setCurrentOperation(toastState.credentialArchived));
    handleDone();
  };

  const handleDeleteCredential = async () => {
    try {
      await AriesAgent.agent.credentials.deleteCredential(params.id);
      dispatch(setCurrentOperation(toastState.credentialDeleted));
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
  };

  const handleRestoreCredential = async () => {
    await AriesAgent.agent.credentials.restoreCredential(params.id);
    try {
      const metadata = await AriesAgent.agent.credentials.getMetadataById(
        params.id
      );
      const creds =
        await AriesAgent.agent.credentials.getCredentialShortDetails(metadata);
      dispatch(setCredsCache([...credsCache, creds]));
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
    dispatch(setCurrentOperation(toastState.credentialRestored));
    handleDone();
  };

  const onVerify = () => {
    if (isArchived) {
      handleDeleteCredential();
    } else {
      handleArchiveCredential();
    }
    setVerifyPasswordIsOpen(false);
    setVerifyPasscodeIsOpen(false);
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
        <IonSpinner name="circular" />
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
        additionalButtons={!isArchived && <AdditionalButtons />}
        actionButton={isArchived}
        actionButtonAction={() => setAlertRestoreIsOpen(true)}
        actionButtonLabel={`${i18n.t("creds.card.details.restore")}`}
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
                  {(credentialSubject.degree as JsonObject)?.type as string}
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
                  {(credentialSubject.degree as JsonObject)?.name as string}
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
                  if (cardData.proofValue) {
                    writeToClipboard(cardData.proofValue);
                    dispatch(setCurrentOperation(toastState.copiedToClipboard));
                  }
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
                  {cardData.proofValue &&
                    cardData.proofValue?.substring(0, 13) +
                      "..." +
                      cardData.proofValue?.slice(-5)}
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
            data-testid="card-details-delete-archive-button"
            className="delete-button"
            onClick={() => {
              setAlertDeleteArchiveIsOpen(true);
              dispatch(
                setCurrentOperation(
                  isArchived
                    ? operationState.deleteCredential
                    : operationState.archiveCredential
                )
              );
            }}
          >
            <IonIcon
              slot="icon-only"
              size="small"
              icon={isArchived ? trashOutline : archiveOutline}
              color="primary"
            />
            {isArchived
              ? i18n.t("creds.card.details.button.delete")
              : i18n.t("creds.card.details.button.archive")}
          </IonButton>
        </div>
        <CredsOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          id={params.id}
          credsOptionAction={
            isArchived ? handleDeleteCredential : handleArchiveCredential
          }
        />
        <AlertDeleteArchive
          isOpen={alertDeleteArchiveIsOpen}
          setIsOpen={setAlertDeleteArchiveIsOpen}
          dataTestId="alert-delete-archive"
          headerText={i18n.t(
            isArchived
              ? "creds.card.details.alert.delete.title"
              : "creds.card.details.alert.archive.title"
          )}
          confirmButtonText={`${i18n.t(
            isArchived
              ? "creds.card.details.alert.delete.confirm"
              : "creds.card.details.alert.archive.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            isArchived
              ? "creds.card.details.alert.delete.cancel"
              : "creds.card.details.alert.archive.cancel"
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
        <AlertRestore
          isOpen={alertRestoreIsOpen}
          setIsOpen={setAlertRestoreIsOpen}
          dataTestId="alert-restore"
          headerText={i18n.t("creds.card.details.alert.restore.title")}
          confirmButtonText={`${i18n.t(
            "creds.card.details.alert.restore.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "creds.card.details.alert.restore.cancel"
          )}`}
          actionConfirm={() => handleRestoreCredential()}
          actionCancel={() => dispatch(setCurrentOperation(""))}
          actionDismiss={() => dispatch(setCurrentOperation(""))}
        />
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={onVerify}
        />
        <VerifyPasscode
          isOpen={verifyPasscodeIsOpen}
          setIsOpen={setVerifyPasscodeIsOpen}
          onVerify={onVerify}
        />
      </TabLayout>
    </IonPage>
  );
};

export { CredCardDetails };
