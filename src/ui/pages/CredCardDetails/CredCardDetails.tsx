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
import { JsonObject } from "@aries-framework/core";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { VerifyPassword } from "../../components/VerifyPassword";
import {
  Alert as AlertDeleteArchive,
  Alert as AlertRestore,
} from "../../components/Alert";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { CredsOptions } from "../../components/CredsOptions";
import {
  MAX_FAVOURITES,
  operationState,
  toastState,
} from "../../constants/dictionary";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { CredentialDetails } from "../../../core/agent/agent.types";
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
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { ConnectionDetails } from "../Connections/Connections.types";
import {
  CardDetailsBlock,
  CardDetailsItem,
} from "../../components/CardDetailsElements";

const CredCardDetails = () => {
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
          dispatch(setCurrentOperation(toastState.maxFavouritesReached));
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
    // @TODO: handle when credentialSubject is an array
    if (Array.isArray(credentialSubject)) {
      return null;
    }

    const PrintJson = () => {
      const object = Object.entries(cardData.credentialSubject);
      return (
        <div className="credential-subject-json">
          {object.map((item, index) => {
            return (
              <span
                className="card-details-info-block-line"
                key={index}
              >
                <strong>{item[0]}</strong>
                {typeof item[1] === ("string" || "number") && (
                  <span>{`${item[1]}`}</span>
                )}
                {typeof item[1] === "object" &&
                  item[1] !== null &&
                  Object.entries(item[1]).map((sub: any, i: number) => {
                    return (
                      <span
                        className="card-details-info-block-line"
                        key={i}
                      >
                        <strong>{sub[0]}</strong>
                        {typeof sub[1] === ("string" || "number") ? (
                          <span>{`${sub[1]}`}</span>
                        ) : (
                          "Object"
                        )}
                      </span>
                    );
                  })}
              </span>
            );
          })}
        </div>
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
            <CardDetailsBlock title="creds.card.details.attributes">
              <PrintJson />
            </CardDetailsBlock>
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
  }
};

export { CredCardDetails };
