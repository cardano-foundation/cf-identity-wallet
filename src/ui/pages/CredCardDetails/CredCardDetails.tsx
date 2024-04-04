import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { ellipsisVertical, heart, heartOutline } from "ionicons/icons";
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
  ACDCDetails,
  W3CCredentialDetails,
} from "../../../core/agent/services/credentialService.types";
import "../../components/CardDetails/CardDetails.scss";
import "./CredCardDetails.scss";
import { PageFooter } from "../../components/PageFooter";
import { ConnectionType } from "../../../core/agent/agent.types";
import { CredContentW3c } from "./components/CredContentW3c";
import { CredContentAcdc } from "./components/CredContentAcdc";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

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
  const [cardData, setCardData] = useState<
    W3CCredentialDetails | ACDCDetails
  >();
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails>();

  const [navAnimation, setNavAnimation] = useState(false);
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

    // if (cardDetails.connectionType === ConnectionType.DIDCOMM) {
    //   const connectionDetails =
    //     cardDetails.connectionId &&
    //     (await AriesAgent.agent.connections?.getConnectionById(
    //       cardDetails.connectionId
    //     ));
    //   if (connectionDetails) {
    //     setConnectionDetails(connectionDetails);
    //   }
    // }
  };

  const handleDone = () => {
    setNavAnimation(true);

    const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.CRED_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      nextPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );

    setTimeout(() => {
      history.push(nextPath.pathname);
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setNavAnimation(false);
    }, CLEAR_ANIMATION);
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
    const creds =
      await AriesAgent.agent.credentials.getCredentialShortDetailsById(
        params.id
      );
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

  if (
    cardData &&
    cardData.connectionType === ConnectionType.DIDCOMM &&
    Array.isArray(cardData.credentialSubject)
  ) {
    // @TODO - sdisalvo: Prevent app crashing when credentialSubject is an array
    // Keeping this as a safety net as we may want to show a message in the future.
    return null;
  }

  const pageClasses = `cred-card-detail card-details${
    isArchived ? " archived-credential" : ""
  } ${navAnimation ? "cred-back-animation" : "cred-open-animation"}`;

  return (
    <TabLayout
      pageId={pageId}
      customClass={pageClasses}
      header={true}
      doneLabel={`${i18n.t("creds.card.details.done")}`}
      doneAction={handleDone}
      additionalButtons={!isArchived && <AdditionalButtons />}
      actionButton={isArchived}
      actionButtonAction={() => setAlertRestoreIsOpen(true)}
      actionButtonLabel={`${i18n.t("creds.card.details.restore")}`}
    >
      {!cardData ? (
        <div
          className="cred-detail-spinner-container"
          data-testid="cred-detail-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      ) : (
        <>
          <CredCardTemplate
            cardData={cardData}
            isActive={false}
          />
          <div className="card-details-content">
            {cardData.connectionType === ConnectionType.DIDCOMM ? (
              <CredContentW3c
                cardData={cardData}
                connectionDetails={connectionDetails}
              />
            ) : (
              <CredContentAcdc cardData={cardData} />
            )}
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
        </>
      )}

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
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
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
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
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
  );
};

export { CredCardDetails };
