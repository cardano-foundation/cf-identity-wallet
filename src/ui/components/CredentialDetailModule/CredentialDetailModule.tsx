import { IonButton, IonCheckbox, IonIcon, IonSpinner } from "@ionic/react";
import { ellipsisVertical, heart, heartOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  MiscRecordId,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import {
  ACDCDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";
import {
  addFavouritesCredsCache,
  getCredsCache,
  getFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import "../../components/CardDetails/CardDetails.scss";
import { MAX_FAVOURITES } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { useOnlineStatusEffect } from "../../hooks";
import { combineClassNames } from "../../utils/style";
import { Alert as AlertDeleteArchive, Alert as AlertRestore } from "../Alert";
import { CredentialCardTemplate } from "../CredentialCardTemplate";
import { CredentialOptions } from "../CredentialOptions";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageFooter } from "../PageFooter";
import { PageHeader } from "../PageHeader";
import { Verification } from "../Verification";
import { CredentialContent } from "./components/CredentialContent";
import "./CredentialDetailModule.scss";
import {
  BackReason,
  CredentialDetailModuleProps,
} from "./CredentialDetailModule.types";
import { CloudError } from "../CloudError";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../store/reducers/notificationsCache";
import { showError } from "../../utils/error";

const CredentialDetailModule = ({
  pageId,
  id,
  onClose,
  hardwareBackButtonConfig,
  navAnimation = false,
  credDetail,
  viewOnly,
  ...props
}: CredentialDetailModuleProps) => {
  const { isLightMode } = props;
  const selected = isLightMode ? props.selected : false;
  const setSelected = isLightMode ? props.setSelected : undefined;
  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const favouritesCredsCache = useAppSelector(getFavouritesCredsCache);
  const notifications = useAppSelector(getNotificationsCache);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteArchiveIsOpen, setAlertDeleteArchiveIsOpen] =
    useState(false);
  const [alertRestoreIsOpen, setAlertRestoreIsOpen] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [cardData, setCardData] = useState<ACDCDetails>();

  const isArchived = credsCache.filter((item) => item.id === id).length === 0;
  const isRevoked = cardData?.status === CredentialStatus.REVOKED;
  const isInactiveCred = (isArchived || isRevoked) && !viewOnly;

  const isFavourite = favouritesCredsCache?.some((fav) => fav.id === id);
  const [cloudError, setCloudError] = useState(false);

  const fetchArchivedCreds = useCallback(async () => {
    try {
      const creds = await Agent.agent.credentials.getCredentials(true);
      dispatch(setCredsArchivedCache(creds));
    } catch (e) {
      showError("Unable to get archived credential", e, dispatch);
    }
  }, [dispatch]);

  const getCredDetails = useCallback(async () => {
    if (credDetail) {
      setCardData(credDetail);
      return;
    }

    if (!id) return;

    try {
      const cardDetails =
        await Agent.agent.credentials.getCredentialDetailsById(id);
      setCardData(cardDetails);
    } catch (error) {
      setCloudError(true);
      showError("Unable to get credential detail", error, dispatch);
    }
  }, [id, dispatch, credDetail]);

  useOnlineStatusEffect(getCredDetails);

  const deleteRevokedNotification = async () => {
    const notification = notifications.find(
      (noti) => noti.a.credentialId === id
    );

    if (!notification) return;

    await Agent.agent.keriaNotifications.deleteNotificationRecordById(
      notification.id,
      notification.a.r as NotificationRoute
    );

    let newNotification = [...notifications];

    newNotification = newNotification.filter(
      (noti) => noti.a.credentialId !== id
    );

    dispatch(setNotificationsCache(newNotification));
  };

  const handleDeleteRevokedCred = async () => {
    try {
      await Agent.agent.credentials.archiveCredential(id);
      await Agent.agent.credentials.deleteCredential(id);
      const creds = credsCache.filter((item) => item.id !== id);
      if (isFavourite) {
        handleSetFavourite(id);
      }
      dispatch(setCredsCache(creds));
      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
      await deleteRevokedNotification();
    } catch (e) {
      showError(
        "Unable to archive credential",
        e,
        dispatch,
        ToastMsgType.DELETE_CRED_FAIL
      );
    }
  };

  const handleArchiveCredential = async () => {
    try {
      await Agent.agent.credentials.archiveCredential(id);
      await fetchArchivedCreds();
      const creds = credsCache.filter((item) => item.id !== id);
      if (isFavourite) {
        handleSetFavourite(id);
      }
      dispatch(setCredsCache(creds));
      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_ARCHIVED));
    } catch (e) {
      showError(
        "Unable to archive credential",
        e,
        dispatch,
        ToastMsgType.ARCHIVED_CRED_FAIL
      );
    }
  };

  const handleDeleteCredential = async () => {
    try {
      await Agent.agent.credentials.deleteCredential(id);
      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
      await fetchArchivedCreds();
    } catch (e) {
      showError(
        "Unable to delete credential",
        e,
        dispatch,
        ToastMsgType.DELETE_CRED_FAIL
      );
    }
  };

  const handleRestoreCredential = async () => {
    try {
      await Agent.agent.credentials.restoreCredential(id);
      const creds = await Agent.agent.credentials.getCredentialShortDetailsById(
        id
      );
      await fetchArchivedCreds();
      dispatch(setCredsCache([...credsCache, creds]));

      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_RESTORED));
      onClose?.(BackReason.RESTORE);
    } catch (e) {
      showError("Unable to restore credential", e, dispatch);
    }
  };

  const onVerify = async () => {
    const backReason = isInactiveCred ? BackReason.DELETE : BackReason.ARCHIVED;
    if (isArchived) {
      await handleDeleteCredential();
    } else if (isRevoked) {
      await handleDeleteRevokedCred();
    } else {
      await handleArchiveCredential();
    }

    onClose?.(backReason);
    setVerifyIsOpen(false);
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
        .catch((e) => {
          showError("Unable to remove favourite cred", e, dispatch);
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
        .catch((e) => {
          showError("Unable to add favourite credential", e, dispatch);
        });
    }
  };

  const toggleFavouriteCred = () => {
    if (!cardData) return;
    handleSetFavourite(id);
  };

  const openOptionModal = () => {
    if (!cardData) return;
    setOptionsIsOpen(true);
  };

  const AdditionalButtons = () => {
    if (viewOnly) {
      return null;
    }

    if (isLightMode) {
      return (
        <IonCheckbox
          checked={selected}
          aria-label=""
          className="notification-selected"
          data-testid="notification-selected"
          onIonChange={(e) => {
            e.stopPropagation();
            setSelected?.(e.detail.checked);
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
      "archived-credential": isInactiveCred,
      "cred-back-animation": navAnimation,
      "cred-open-animation": !navAnimation,
      revoked: isRevoked,
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
    setVerifyIsOpen(true);
  };

  const actionButtonLabel = i18n.t(
    isRevoked
      ? "tabs.credentials.details.delete"
      : "tabs.credentials.details.restore"
  );

  const action = () => {
    if (isRevoked) {
      return handleDelete();
    }

    setAlertRestoreIsOpen(true);
  };

  if (cloudError) {
    return (
      <CloudError
        pageId={pageId}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("tabs.identifiers.details.done")}`}
            closeButtonAction={() => onClose?.(BackReason.DELETE)}
          />
        }
      >
        <PageFooter
          pageId={pageId}
          deleteButtonText={`${i18n.t(
            "tabs.credentials.details.button.delete"
          )}`}
          deleteButtonAction={() => handleDelete()}
        />
      </CloudError>
    );
  }

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        customClass={pageClasses}
        header={
          <PageHeader
            closeButton
            closeButtonLabel={`${i18n.t("tabs.credentials.details.done")}`}
            closeButtonAction={() => onClose?.(BackReason.CLOSE)}
            additionalButtons={!isInactiveCred && <AdditionalButtons />}
            actionButton={isInactiveCred}
            actionButtonAction={action}
            actionButtonLabel={`${actionButtonLabel}`}
            hardwareBackButtonConfig={hardwareBackButtonConfig}
          />
        }
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
            {isRevoked && (
              <div className="revoked-alert">
                {i18n.t("tabs.credentials.details.revoked")}
              </div>
            )}
            <CredentialCardTemplate
              cardData={{
                ...cardData,
                issuanceDate: cardData.a.dt,
                credentialType: cardData.s.title || "",
              }}
              isActive={false}
            />
            <div className="card-details-content">
              <CredentialContent cardData={cardData} />
              {!viewOnly && (
                <PageFooter
                  pageId={pageId}
                  archiveButtonText={
                    !isInactiveCred
                      ? `${i18n.t("tabs.credentials.details.button.archive")}`
                      : ""
                  }
                  archiveButtonAction={() => handleArchive()}
                  deleteButtonText={
                    isInactiveCred
                      ? `${i18n.t("tabs.credentials.details.button.delete")}`
                      : ""
                  }
                  deleteButtonAction={() => handleDelete()}
                />
              )}
            </div>
            <CredentialOptions
              optionsIsOpen={optionsIsOpen}
              setOptionsIsOpen={setOptionsIsOpen}
              credsOptionAction={() => setAlertDeleteArchiveIsOpen(true)}
            />
          </>
        )}
      </ScrollablePageLayout>
      <AlertDeleteArchive
        isOpen={alertDeleteArchiveIsOpen}
        setIsOpen={setAlertDeleteArchiveIsOpen}
        dataTestId="alert-delete-archive"
        headerText={i18n.t(
          isInactiveCred
            ? "tabs.credentials.details.alert.delete.title"
            : "tabs.credentials.details.alert.archive.title"
        )}
        confirmButtonText={`${i18n.t(
          isInactiveCred
            ? "tabs.credentials.details.alert.delete.confirm"
            : "tabs.credentials.details.alert.archive.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          isInactiveCred
            ? "tabs.credentials.details.alert.delete.cancel"
            : "tabs.credentials.details.alert.archive.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
      <AlertRestore
        isOpen={alertRestoreIsOpen}
        setIsOpen={setAlertRestoreIsOpen}
        dataTestId="alert-restore"
        headerText={i18n.t("tabs.credentials.details.alert.restore.title")}
        confirmButtonText={`${i18n.t(
          "tabs.credentials.details.alert.restore.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "tabs.credentials.details.alert.restore.cancel"
        )}`}
        actionConfirm={() => handleRestoreCredential()}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={onVerify}
      />
    </>
  );
};

export { CredentialDetailModule };
