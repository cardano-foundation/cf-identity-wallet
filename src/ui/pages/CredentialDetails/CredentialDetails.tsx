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
import { CredentialOptions } from "../../components/CredentialOptions";
import { MAX_FAVOURITES } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { Agent } from "../../../core/agent/agent";
import {
  addFavouritesCredsCache,
  getCredsCache,
  getFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { CredentialCardTemplate } from "../../components/CredentialCardTemplate";
import { ACDCDetails } from "../../../core/agent/services/credentialService.types";
import "../../components/CardDetails/CardDetails.scss";
import "./CredentialDetails.scss";
import { PageFooter } from "../../components/PageFooter";
import { CredentialContent } from "./components/CredentialContent";
import { combineClassNames } from "../../utils/style";
import { useAppIonRouter } from "../../hooks";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

const CredentialDetails = () => {
  const pageId = "credential-card-details";
  const ionRouter = useAppIonRouter();
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
  const [cardData, setCardData] = useState<ACDCDetails>();

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
    const cardDetails = await Agent.agent.credentials.getCredentialDetailsById(
      params.id
    );
    setCardData(cardDetails);
  };

  const handleDone = () => {
    setNavAnimation(true);

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
    const creds = credsCache.filter((item) => item.id !== params.id);
    if (isFavourite) {
      handleSetFavourite(params.id);
    }
    dispatch(setCredsCache(creds));

    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_ARCHIVED));
  };

  const handleDeleteCredential = async () => {
    // @TODO - sdisalvo: handle error
    await Agent.agent.credentials.deleteCredential(params.id);
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));
  };

  const handleRestoreCredential = async () => {
    await Agent.agent.credentials.restoreCredential(params.id);
    // @TODO - sdisalvo: handle error
    const creds = await Agent.agent.credentials.getCredentialShortDetailsById(
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
        .catch((error) => {
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
        .catch((error) => {
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
            cardData={cardData}
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
