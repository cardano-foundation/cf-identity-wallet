import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { ellipsisVertical, heart, heartOutline } from "ionicons/icons";
import { useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { ACDCDetails } from "../../../core/agent/services/credentialService.types";
import { i18n } from "../../../i18n";
import { getNextRoute } from "../../../routes/nextRoute";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addFavouritesCredsCache,
  getCredsCache,
  getFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import {
  getNotificationDetailCache,
  setNotificationDetailCache,
} from "../../../store/reducers/notificationsCache";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import {
  Alert as AlertDeleteArchive,
  Alert as AlertRestore,
} from "../../components/Alert";
import "../../components/CardDetails/CardDetails.scss";
import { CredentialCardTemplate } from "../../components/CredentialCardTemplate";
import { CredentialOptions } from "../../components/CredentialOptions";
import { TabLayout } from "../../components/layout/TabLayout";
import { PageFooter } from "../../components/PageFooter";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { VerifyPassword } from "../../components/VerifyPassword";
import { MAX_FAVOURITES } from "../../globals/constants";
import {
  BackEventPriorityType,
  OperationType,
  ToastMsgType,
} from "../../globals/types";
import { useAppIonRouter, useOnlineStatusEffect } from "../../hooks";
import { combineClassNames } from "../../utils/style";
import { CredentialContent } from "./components/CredentialContent";
import "./CredentialDetails.scss";
import { CredHistory } from "./CredentialDetails.types";
import { NotificationDetailCacheState } from "../../../store/reducers/notificationsCache/notificationCache.types";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

const CredentialDetails = () => {
  const pageId = "credential-card-details";
  const ionRouter = useAppIonRouter();
  const history = useHistory<CredHistory>();
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
  const [cardData, setCardData] = useState<ACDCDetails>();
  const [navAnimation, setNavAnimation] = useState(false);

  const notificationDetailCache = useAppSelector(getNotificationDetailCache);
  const [notiSelected, setNotiSelected] = useState(
    !!notificationDetailCache?.checked
  );

  const isLightMode = !!notificationDetailCache;

  const isArchived =
    credsCache.filter((item) => item.id === params.id).length === 0;
  const isFavourite = favouritesCredsCache?.some((fav) => fav.id === params.id);

  const fetchArchivedCreds = useCallback(async () => {
    try {
      const creds = await Agent.agent.credentials.getCredentials(true);
      dispatch(setCredsArchivedCache(creds));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setToastMsg(ToastMsgType.GET_ARCH_CRED_FAIL));
    }
  }, [dispatch]);

  const getCredDetails = useCallback(async () => {
    const cardDetails = await Agent.agent.credentials.getCredentialDetailsById(
      params.id
    );
    setCardData(cardDetails);
  }, [params.id]);

  useOnlineStatusEffect(getCredDetails);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleBackNotification = (
    notificationDetailCache: NotificationDetailCacheState
  ) => {
    dispatch(
      setNotificationDetailCache({
        ...notificationDetailCache,
        step: 1,
        checked: notiSelected,
      })
    );

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationDetailCache.notificationId}`;

    setTimeout(() => {
      ionRouter.push(path, "back", "pop");
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setNavAnimation(false);
    }, CLEAR_ANIMATION);
  };

  const handleDone = () => {
    setNavAnimation(true);

    if (isLightMode) {
      handleBackNotification(notificationDetailCache);
      return;
    }

    const { nextPath, updateRedux } = getNextRoute(
      TabsRoutePath.CREDENTIAL_DETAILS,
      {
        store: { stateCache },
      }
    );

    updateReduxState(
      nextPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );

    setTimeout(() => {
      ionRouter.push(nextPath.pathname, "back", "pop");
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setNavAnimation(false);
    }, CLEAR_ANIMATION);
  };

  const handleArchiveCredential = async () => {
    await Agent.agent.credentials.archiveCredential(params.id);
    await fetchArchivedCreds();
    const creds = credsCache.filter((item) => item.id !== params.id);
    if (isFavourite) {
      handleSetFavourite(params.id);
    }
    dispatch(setCredsCache(creds));
    dispatch(setNotificationDetailCache(null));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_ARCHIVED));
  };

  const handleDeleteCredential = async () => {
    try {
      await Agent.agent.credentials.deleteCredential(params.id);
      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
      await fetchArchivedCreds();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setToastMsg(ToastMsgType.DELETE_CRED_FAIL));
    }
  };

  const handleRestoreCredential = async () => {
    await Agent.agent.credentials.restoreCredential(params.id);
    // @TODO - sdisalvo: handle error
    const creds = await Agent.agent.credentials.getCredentialShortDetailsById(
      params.id
    );
    await fetchArchivedCreds();
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
      const favouriteRecord = new BasicRecord({
        id: MiscRecordId.CREDS_FAVOURITES,
        content: {
          favourites: favouritesCredsCache.filter((fav) => fav.id !== id),
        },
      });
      Agent.agent.basicStorage
        .createOrUpdateBasicRecord(favouriteRecord)
        .then(() => {
          dispatch(removeFavouritesCredsCache(id));
        })
        .catch(() => {
          /*TODO: handle error*/
        });
    } else {
      if (favouritesCredsCache.length >= MAX_FAVOURITES) {
        dispatch(setToastMsg(ToastMsgType.MAX_FAVOURITES_REACHED));
        return;
      }

      Agent.agent.basicStorage
        .createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.CREDS_FAVOURITES,
            content: {
              favourites: [{ id, time: Date.now() }, ...favouritesCredsCache],
            },
          })
        )
        .then(() => {
          dispatch(addFavouritesCredsCache({ id, time: Date.now() }));
        })
        .catch(() => {
          /*TODO: handle error*/
        });
    }
  };

  const toggleFavouriteCred = () => {
    if (!cardData) return;
    handleSetFavourite(params.id);
  };

  const openOptionModal = () => {
    if (!cardData) return;
    setOptionsIsOpen(true);
  };

  const AdditionalButtons = () => {
    if (isLightMode) {
      return (
        <IonCheckbox
          checked={notiSelected}
          aria-label=""
          className="notification-selected"
          data-testid="notification-selected"
          onIonChange={(e) => {
            e.stopPropagation();
            setNotiSelected(e.detail.checked);
          }}
        />
      );
    }

    return (
      <>
        <IonButton
          shape="round"
          className={`heart-button-${
            isFavourite ? "favourite" : "no-favourite"
          }`}
          data-testid="heart-button"
          onClick={toggleFavouriteCred}
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
          onClick={openOptionModal}
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

  const pageClasses = combineClassNames(
    "cred-card-detail card-details cred-open-animation",
    {
      "archived-credential": isArchived,
      "cred-back-animation": navAnimation,
      "cred-open-animation": !navAnimation,
    }
  );

  const handleArchive = () => {
    setAlertDeleteArchiveIsOpen(true);
    dispatch(setCurrentOperation(OperationType.ARCHIVE_CREDENTIAL));
  };

  const handleDelete = () => {
    setAlertDeleteArchiveIsOpen(true);
    dispatch(setCurrentOperation(OperationType.DELETE_CREDENTIAL));
  };

  const handleAuthentication = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const hardwareBackButtonConfig = useMemo(
    () => ({
      prevent: false,
      priority: isLightMode
        ? BackEventPriorityType.Page
        : BackEventPriorityType.Tab,
    }),
    [isLightMode]
  );

  return (
    <TabLayout
      pageId={pageId}
      customClass={pageClasses}
      header={true}
      doneLabel={`${i18n.t("credentials.details.done")}`}
      doneAction={handleDone}
      additionalButtons={!isArchived && <AdditionalButtons />}
      actionButton={isArchived}
      actionButtonAction={() => setAlertRestoreIsOpen(true)}
      actionButtonLabel={`${i18n.t("credentials.details.restore")}`}
      hardwareBackButtonConfig={hardwareBackButtonConfig}
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
          <CredentialCardTemplate
            cardData={cardData}
            isActive={false}
          />
          <div className="card-details-content">
            <CredentialContent cardData={cardData} />
            <PageFooter
              pageId={pageId}
              archiveButtonText={
                !isArchived
                  ? `${i18n.t("credentials.details.button.archive")}`
                  : ""
              }
              archiveButtonAction={() => handleArchive()}
              deleteButtonText={
                isArchived
                  ? `${i18n.t("credentials.details.button.delete")}`
                  : ""
              }
              deleteButtonAction={() => handleDelete()}
            />
          </div>
          <CredentialOptions
            optionsIsOpen={optionsIsOpen}
            setOptionsIsOpen={setOptionsIsOpen}
            credsOptionAction={() => setAlertDeleteArchiveIsOpen(true)}
          />
        </>
      )}

      <AlertDeleteArchive
        isOpen={alertDeleteArchiveIsOpen}
        setIsOpen={setAlertDeleteArchiveIsOpen}
        dataTestId="alert-delete-archive"
        headerText={i18n.t(
          isArchived
            ? "credentials.details.alert.delete.title"
            : "credentials.details.alert.archive.title"
        )}
        confirmButtonText={`${i18n.t(
          isArchived
            ? "credentials.details.alert.delete.confirm"
            : "credentials.details.alert.archive.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          isArchived
            ? "credentials.details.alert.delete.cancel"
            : "credentials.details.alert.archive.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
      <AlertRestore
        isOpen={alertRestoreIsOpen}
        setIsOpen={setAlertRestoreIsOpen}
        dataTestId="alert-restore"
        headerText={i18n.t("credentials.details.alert.restore.title")}
        confirmButtonText={`${i18n.t(
          "credentials.details.alert.restore.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "credentials.details.alert.restore.cancel"
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

export { CredentialDetails };
