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
  calendarNumberOutline,
  informationCircleOutline,
  trashOutline,
  archiveOutline,
  heart,
  heartOutline,
  pricetagOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { VerifyPassword } from "../../components/VerifyPassword";
import {
  Alert as AlertDeleteArchive,
  Alert as AlertRestore,
} from "../../components/Alert";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { CredsOptions } from "../../components/CredsOptions";
import { MAX_FAVOURITES } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { AriesAgent } from "../../../core/agent/agent";
import {
  addFavouritesCredsCache,
  getCredsCache,
  getFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { CredCardTemplate } from "../../components/CredCardTemplate";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";
import { ConnectionDetails } from "../Connections/Connections.types";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
  CardDetailsItem,
} from "../../components/CardDetailsElements";
import { CredentialDetails } from "../../../core/agent/services/credentialService.types";
import "../../components/CardDetailsElements/CardDetails.scss";
import { PageFooter } from "../../components/PageFooter";

const CredCardDetails = () => {
  const pageId = "credential-card-details";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const favouritesCredsCache = useAppSelector(getFavouritesCredsCache);
  const stateCache = useAppSelector(getStateCache);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteArchiveIsOpen, setAlertDeleteArchiveIsOpen] =
    useState(false);
  const [alertRestoreIsOpen, setAlertRestoreIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<CredentialDetails>();
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails>();
  const isArchived =
    credsCache.filter((item) => item.id === params.id).length === 0;
  const isFavourite = favouritesCredsCache?.some((fav) => fav.id === params.id);

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

    const connectionDetails =
      cardDetails.connectionId &&
      (await AriesAgent.agent.connections?.getConnectionById(
        cardDetails.connectionId
      ));
    if (connectionDetails) {
      setConnectionDetails(connectionDetails);
    }
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
    await AriesAgent.agent.credentials.archiveCredential(params.id);
    const creds = credsCache.filter((item) => item.id !== params.id);
    if (isFavourite) {
      handleSetFavourite(params.id);
    }
    dispatch(setCredsCache(creds));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_ARCHIVED));
  };

  const handleDeleteCredential = async () => {
    // @TODO - sdisalvo: handle error
    await AriesAgent.agent.credentials.deleteCredential(params.id);
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
  };

  const handleRestoreCredential = async () => {
    await AriesAgent.agent.credentials.restoreCredential(params.id);
    // @TODO - sdisalvo: handle error
    const metadata = await AriesAgent.agent.credentials.getMetadataById(
      params.id
    );
    const creds =
      AriesAgent.agent.credentials.getCredentialShortDetails(metadata);
    dispatch(setCredsCache([...credsCache, creds]));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_RESTORED));
    handleDone();
  };

  const onVerify = async () => {
    if (isArchived) {
      await handleDeleteCredential();
    } else {
      await handleArchiveCredential();
    }
    setVerifyPasswordIsOpen(false);
    setVerifyPasscodeIsOpen(false);
    handleDone();
  };

  const handleSetFavourite = (id: string) => {
    if (isFavourite) {
      PreferencesStorage.set(PreferencesKeys.APP_CREDS_FAVOURITES, {
        favourites: favouritesCredsCache.filter((fav) => fav.id !== id),
      })
        .then(() => {
          dispatch(removeFavouritesCredsCache(id));
        })
        .catch((error) => {
          /*TODO: handle error*/
        });
    } else {
      if (favouritesCredsCache.length >= MAX_FAVOURITES) {
        dispatch(setToastMsg(ToastMsgType.MAX_FAVOURITES_REACHED));
        return;
      }

      PreferencesStorage.set(PreferencesKeys.APP_CREDS_FAVOURITES, {
        favourites: [{ id, time: Date.now() }, ...favouritesCredsCache],
      })
        .then(() => {
          dispatch(addFavouritesCredsCache({ id, time: Date.now() }));
        })
        .catch((error) => {
          /*TODO: handle error*/
        });
    }
  };

  const AdditionalButtons = () => {
    return (
      <>
        <IonButton
          shape="round"
          className={`heart-button-${
            isFavourite ? "favourite" : "no-favourite"
          }`}
          data-testid="heart-button"
          onClick={() => {
            handleSetFavourite(params.id);
          }}
        >
          <IonIcon
            slot="icon-only"
            icon={isFavourite ? heart : heartOutline}
            className={`heart-icon-${
              isFavourite ? "favourite" : "no-favourite"
            }`}
            data-testid={`heart-icon-${
              isFavourite ? "favourite" : "no-favourite"
            }`}
          />
        </IonButton>
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

  if (!cardData) {
    return (
      <div
        className="spinner-container"
        data-testid="spinner-container"
      >
        <IonSpinner name="circular" />
      </div>
    );
  } else {
    const credentialSubject = cardData.credentialSubject;
    // @TODO - sdisalvo: Prevent app crashing when credentialSubject is an array
    // Keeping this as a safety net as we may want to show a message in the future.
    if (Array.isArray(credentialSubject)) {
      return null;
    }

    return (
      <IonPage className="tab-layout card-details">
        <TabLayout
          pageId={pageId}
          customClass="card-details"
          header={true}
          doneLabel={`${i18n.t("creds.card.details.done")}`}
          doneAction={handleDone}
          menuButton={false}
          additionalButtons={!isArchived && <AdditionalButtons />}
          actionButton={isArchived}
          actionButtonAction={() => setAlertRestoreIsOpen(true)}
          actionButtonLabel={`${i18n.t("creds.card.details.restore")}`}
        >
          <CredCardTemplate
            shortData={cardData}
            isActive={false}
          />
          <div className="card-details-content">
            <CardDetailsBlock title="creds.card.details.type">
              <CardDetailsItem
                info={cardData.credentialType
                  .replace(/([A-Z][a-z])/g, " $1")
                  .replace(/(\d)/g, " $1")}
                icon={informationCircleOutline}
                testId="card-details-credential-type"
              />
            </CardDetailsBlock>
            {credentialSubject && (
              <CardDetailsBlock title="creds.card.details.attributes">
                <CardDetailsAttributes data={credentialSubject} />
              </CardDetailsBlock>
            )}
            {connectionDetails?.label && (
              <CardDetailsBlock title="creds.card.details.connection">
                <CardDetailsItem
                  info={connectionDetails.label}
                  icon={pricetagOutline}
                  testId="card-details-connection-label"
                />
                <CardDetailsItem
                  info={connectionDetails.id}
                  copyButton={true}
                  icon={keyOutline}
                  testId="card-details-connection-id"
                />
              </CardDetailsBlock>
            )}
            <CardDetailsBlock title="creds.card.details.issuancedate">
              <CardDetailsItem
                info={
                  cardData.issuanceDate
                    ? formatShortDate(cardData.issuanceDate) +
                      " - " +
                      formatTimeToSec(cardData.issuanceDate)
                    : i18n.t("creds.card.details.notavailable")
                }
                icon={calendarNumberOutline}
                testId="card-details-issuance-date"
              />
            </CardDetailsBlock>
            <CardDetailsBlock title="creds.card.details.expirationdate">
              <CardDetailsItem
                info={
                  cardData.expirationDate
                    ? formatShortDate(cardData.expirationDate) +
                      " - " +
                      formatTimeToSec(cardData.expirationDate)
                    : i18n.t("creds.card.details.notavailable")
                }
                icon={calendarNumberOutline}
                testId="card-details-expiration-date"
              />
            </CardDetailsBlock>
            <CardDetailsBlock title="creds.card.details.prooftypes">
              <CardDetailsItem
                info={cardData.proofType}
                icon={informationCircleOutline}
                testId="card-details-proof-type"
              />
              {cardData.proofValue && (
                <CardDetailsItem
                  info={cardData.proofValue}
                  copyButton={true}
                  icon={keyOutline}
                  testId="card-details-proof-value"
                />
              )}
            </CardDetailsBlock>
            <PageFooter
              pageId={pageId}
              archiveButtonText={
                !isArchived
                  ? `${i18n.t("creds.card.details.button.archive")}`
                  : ""
              }
              archiveButtonAction={() => {
                setAlertDeleteArchiveIsOpen(true);
                dispatch(setCurrentOperation(OperationType.ARCHIVE_CREDENTIAL));
              }}
              deleteButtonText={
                isArchived
                  ? `${i18n.t("creds.card.details.button.delete")}`
                  : ""
              }
              deleteButtonAction={() => {
                setAlertDeleteArchiveIsOpen(true);
                dispatch(setCurrentOperation(OperationType.DELETE_CREDENTIAL));
              }}
            />
          </div>
          <CredsOptions
            optionsIsOpen={optionsIsOpen}
            setOptionsIsOpen={setOptionsIsOpen}
            cardData={cardData}
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
            actionCancel={() =>
              dispatch(setCurrentOperation(OperationType.IDLE))
            }
            actionDismiss={() =>
              dispatch(setCurrentOperation(OperationType.IDLE))
            }
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
            actionCancel={() =>
              dispatch(setCurrentOperation(OperationType.IDLE))
            }
            actionDismiss={() =>
              dispatch(setCurrentOperation(OperationType.IDLE))
            }
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
  }
};

export { CredCardDetails };
