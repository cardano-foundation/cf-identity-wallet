import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  shareOutline,
  ellipsisVertical,
  heartOutline,
  heart,
} from "ionicons/icons";
import { useCallback, useState } from "react";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ShareConnection } from "../../components/ShareConnection";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import {
  addFavouriteIdentifierCache,
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
  removeFavouriteIdentifierCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import { Agent } from "../../../core/agent/agent";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { IdentifierContent } from "./components/IdentifierContent";
import { MAX_FAVOURITES } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { IdentifierOptions } from "../../components/IdentifierOptions";
import { IdentifierCardTemplate } from "../../components/IdentifierCardTemplate";
import { PageFooter } from "../../components/PageFooter";
import "../../components/CardDetails/CardDetails.scss";
import "./IdentifierDetails.scss";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { combineClassNames } from "../../utils/style";
import { IdentifierDetails as IdentifierDetailsCore } from "../../../core/agent/services/identifier.types";
import { useAppIonRouter, useOnlineStatusEffect } from "../../hooks";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { RotateKeyModal } from "./components/RotateKeyModal";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

const IdentifierDetails = () => {
  const pageId = "identifier-card-details";
  const ionRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const identifierData = useAppSelector(getIdentifiersCache);
  const favouritesIdentifiersData = useAppSelector(
    getFavouritesIdentifiersCache
  );
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [identifierOptionsIsOpen, setIdentifierOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<IdentifierDetailsCore | undefined>();
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [openRotateKeyModal, setOpenRotateKeyModal] = useState(false);
  const [navAnimation, setNavAnimation] = useState(false);

  const isFavourite = favouritesIdentifiersData?.some(
    (fav) => fav.id === params.id
  );

  const fetchDetails = useCallback(async () => {
    const cardDetailsResult = await Agent.agent.identifiers.getIdentifier(
      params.id
    );
    if (cardDetailsResult) {
      setCardData(cardDetailsResult);
    } else {
      // @TODO - Error handling.
    }
  }, [params.id]);

  useOnlineStatusEffect(fetchDetails);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
    setNavAnimation(true);
    const { backPath, updateRedux } = getBackRoute(
      TabsRoutePath.IDENTIFIER_DETAILS,
      {
        store: { stateCache },
      }
    );

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );

    setTimeout(() => {
      ionRouter.push(backPath.pathname, "back", "pop");
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setNavAnimation(false);
    }, CLEAR_ANIMATION);
  };

  const handleDelete = async () => {
    setVerifyPasswordIsOpen(false);
    if (cardData) {
      const updatedIdentifiers = identifierData.filter(
        (item) => item.id !== cardData.id
      );
      await deleteIdentifier();
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_DELETED));
      dispatch(setIdentifiersCache(updatedIdentifiers));
    }
    handleDone();
  };

  const deleteIdentifier = async () => {
    if (cardData) {
      // For now there is no archiving in the UI so does both.
      await Agent.agent.identifiers.archiveIdentifier(cardData.id);
      await Agent.agent.identifiers.deleteIdentifier(cardData.id);
      if (isFavourite) {
        handleSetFavourite(cardData.id);
      }
    }
  };

  const handleSetFavourite = (id: string) => {
    if (isFavourite) {
      Agent.agent.basicStorage
        .createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.IDENTIFIERS_FAVOURITES,
            content: {
              favourites: favouritesIdentifiersData.filter(
                (fav) => fav.id !== id
              ),
            },
          })
        )
        .then(() => {
          dispatch(removeFavouriteIdentifierCache(id));
        })
        .catch((error) => {
          /*TODO: handle error*/
        });
    } else {
      if (favouritesIdentifiersData.length >= MAX_FAVOURITES) {
        dispatch(setToastMsg(ToastMsgType.MAX_FAVOURITES_REACHED));
        return;
      }
      Agent.agent.basicStorage
        .createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.IDENTIFIERS_FAVOURITES,
            content: {
              favourites: [
                { id, time: Date.now() },
                ...favouritesIdentifiersData,
              ],
            },
          })
        )
        .then(() => {
          dispatch(addFavouriteIdentifierCache({ id, time: Date.now() }));
        })
        .catch((error) => {
          /*TODO: handle error*/
        });
    }
  };

  const deleteButtonAction = () => {
    setAlertIsOpen(true);
    dispatch(setCurrentOperation(OperationType.DELETE_IDENTIFIER));
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

  const toggleFavourite = () => {
    if (!cardData) return;
    handleSetFavourite(params.id);
  };

  const openShareModal = () => {
    if (!cardData) return;
    setShareIsOpen(true);
  };

  const openOptionModal = () => {
    if (!cardData) return;
    setIdentifierOptionsIsOpen(true);
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
          onClick={toggleFavourite}
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
          className="share-button"
          data-testid="share-button"
          onClick={openShareModal}
        >
          <IonIcon
            slot="icon-only"
            icon={shareOutline}
            color="primary"
          />
        </IonButton>
        <IonButton
          shape="round"
          className="identifier-options-button"
          data-testid="identifier-options-button"
          onClick={openOptionModal}
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

  const pageClasses = combineClassNames("card-details", {
    "back-animation": navAnimation,
    "open-animation": !navAnimation,
  });

  return (
    <ScrollablePageLayout
      pageId={pageId}
      customClass={pageClasses}
      header={
        <PageHeader
          closeButton={true}
          closeButtonLabel={`${i18n.t("identifiers.details.done")}`}
          closeButtonAction={() => handleDone()}
          additionalButtons={<AdditionalButtons />}
        />
      }
    >
      {!cardData ? (
        <div
          className="identifier-card-detail-spinner-container"
          data-testid="identifier-card-detail-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      ) : (
        <>
          <IdentifierCardTemplate
            cardData={cardData}
            isActive={false}
          />
          <div className="card-details-content">
            <IdentifierContent
              onOpenRotateKey={() => setOpenRotateKeyModal(true)}
              cardData={cardData as IdentifierDetailsCore}
            />
            <PageFooter
              pageId={pageId}
              deleteButtonText={`${i18n.t(
                "identifiers.details.delete.button"
              )}`}
              deleteButtonAction={() => deleteButtonAction()}
            />
          </div>
          <ShareConnection
            isOpen={shareIsOpen}
            setIsOpen={setShareIsOpen}
            signifyName={cardData.signifyName}
          />
          <IdentifierOptions
            handleRotateKey={() => setOpenRotateKeyModal(true)}
            optionsIsOpen={identifierOptionsIsOpen}
            setOptionsIsOpen={setIdentifierOptionsIsOpen}
            cardData={cardData}
            setCardData={setCardData}
            handleDeleteIdentifier={() => setAlertIsOpen(true)}
          />
        </>
      )}
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm-identifier-delete-details"
        headerText={i18n.t("identifiers.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "identifiers.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "identifiers.details.delete.alert.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
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
      <RotateKeyModal
        identifierId={params.id}
        onReloadData={fetchDetails}
        signingKey={cardData?.k[0] || ""}
        isOpen={openRotateKeyModal}
        onClose={() => setOpenRotateKeyModal(false)}
      />
    </ScrollablePageLayout>
  );
};

export { IdentifierDetails };
