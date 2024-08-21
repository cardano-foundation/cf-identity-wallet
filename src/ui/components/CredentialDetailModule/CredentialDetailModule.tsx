import { IonButton, IonCheckbox, IonIcon, IonSpinner } from "@ionic/react";
import { ellipsisVertical, heart, heartOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
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

const CredentialDetailModule = ({
  pageId,
  id,
  onClose,
  hardwareBackButtonConfig,
  navAnimation = false,
  ...props
}: CredentialDetailModuleProps) => {
  const { isLightMode } = props;
  const selected = isLightMode ? props.selected : false;
  const setSelected = isLightMode ? props.setSelected : undefined;

  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const favouritesCredsCache = useAppSelector(getFavouritesCredsCache);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteArchiveIsOpen, setAlertDeleteArchiveIsOpen] =
    useState(false);
  const [alertRestoreIsOpen, setAlertRestoreIsOpen] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [cardData, setCardData] = useState<ACDCDetails>();

  const isArchived = credsCache.filter((item) => item.id === id).length === 0;
  const isRevoked = cardData?.status === CredentialStatus.REVOKED;
  const isInactiveCred = isArchived || isRevoked;

  const isFavourite = favouritesCredsCache?.some((fav) => fav.id === id);
  const [cloudError, setCloudError] = useState(false);

  const fetchArchivedCreds = useCallback(async () => {
    try {
      const creds = await Agent.agent.credentials.getCredentials(true);
      dispatch(setCredsArchivedCache(creds));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Unable to get archived credential", e);
    }
  }, [dispatch]);

  const getCredDetails = useCallback(async () => {
    try {
      const cardDetails =
        await Agent.agent.credentials.getCredentialDetailsById(id);
      setCardData(cardDetails);
    } catch (error) {
      setCloudError(true);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [id]);

  useOnlineStatusEffect(getCredDetails);

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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Unable to archive credential", e);
      dispatch(setToastMsg(ToastMsgType.ARCHIVED_CRED_FAIL));
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
      // eslint-disable-next-line no-console
      console.error("Unable to archive credential", e);
      dispatch(setToastMsg(ToastMsgType.ARCHIVED_CRED_FAIL));
    }
  };

  const handleDeleteCredential = async () => {
    try {
      await Agent.agent.credentials.deleteCredential(id);
      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
      await fetchArchivedCreds();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Unable to delete credential", e);
      dispatch(setToastMsg(ToastMsgType.DELETE_CRED_FAIL));
    }
  };

  const handleRestoreCredential = async () => {
    await Agent.agent.credentials.restoreCredential(id);
    // @TODO - sdisalvo: handle error
    const creds = await Agent.agent.credentials.getCredentialShortDetailsById(
      id
    );
    await fetchArchivedCreds();
    dispatch(setCredsCache([...credsCache, creds]));

    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_RESTORED));
    onClose?.(BackReason.RESTORE);
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
    handleSetFavourite(id);
  };

  const openOptionModal = () => {
    if (!cardData) return;
    setOptionsIsOpen(true);
  };

  const AdditionalButtons = () => {
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
    isRevoked ? "credentials.details.delete" : "credentials.details.restore"
  );

  const action = () => {
    if (isRevoked) {
      return handleDelete();
    }

    setAlertRestoreIsOpen(true);
  };


  if(cloudError) {
    return (
      <CloudError
        pageId={pageId}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("identifiers.details.done")}`}
            closeButtonAction={() => onClose?.(BackReason.DELETE)}
          />
        }
      >
        <PageFooter
          pageId={pageId}
          deleteButtonText={`${i18n.t("credentials.details.button.delete")}`}
          deleteButtonAction={() => handleDelete()}
        />
      </CloudError>
    )
  }

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        customClass={pageClasses}
        header={
          <PageHeader
            closeButton
            closeButtonLabel={`${i18n.t("credentials.details.done")}`}
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
                {i18n.t("credentials.details.revoked")}
              </div>
            )}
            <CredentialCardTemplate
              cardData={cardData}
              isActive={false}
            />
            <div className="card-details-content">
              <CredentialContent cardData={cardData} />
              <PageFooter
                pageId={pageId}
                archiveButtonText={
                  !isInactiveCred
                    ? `${i18n.t("credentials.details.button.archive")}`
                    : ""
                }
                archiveButtonAction={() => handleArchive()}
                deleteButtonText={
                  isInactiveCred
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
      </ScrollablePageLayout>
      <AlertDeleteArchive
        isOpen={alertDeleteArchiveIsOpen}
        setIsOpen={setAlertDeleteArchiveIsOpen}
        dataTestId="alert-delete-archive"
        headerText={i18n.t(
          isInactiveCred
            ? "credentials.details.alert.delete.title"
            : "credentials.details.alert.archive.title"
        )}
        confirmButtonText={`${i18n.t(
          isInactiveCred
            ? "credentials.details.alert.delete.confirm"
            : "credentials.details.alert.archive.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          isInactiveCred
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={onVerify}
      />
    </>
  );
};

export { CredentialDetailModule };
