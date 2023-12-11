import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  shareOutline,
  ellipsisVertical,
  trashOutline,
  heartOutline,
  heart,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
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
import { ShareIdentifier } from "../../components/ShareIdentifier";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import {
  addFavouriteIdentifierCache,
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
  removeFavouriteIdentifierCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import { AriesAgent } from "../../../core/agent/agent";
import {
  DIDDetails,
  IdentifierType,
  KERIDetails,
} from "../../../core/agent/services/identifierService.types";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { IdentifierCardInfoDid } from "../../components/IdentifierCardInfoKey";
import { IdentifierCardInfoKeri } from "../../components/IdentifierCardInfoKeri";
import { MAX_FAVOURITES } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { IdentifierOptions } from "../../components/IdentifierOptions";
import { IdentifierCardTemplate } from "../../components/IdentifierCardTemplate";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";
import "./IdentifierCardDetails.scss";
import PageFooter from "../../components/PageFooter/PageFooter";

const IdentifierCardDetails = () => {
  const pageId = "identifier-card-details";
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
  const [cardData, setCardData] = useState<
    DIDDetails | KERIDetails | undefined
  >();
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const isFavourite = favouritesIdentifiersData?.some(
    (fav) => fav.id === params.id
  );

  useEffect(() => {
    const fetchDetails = async () => {
      const cardDetailsResult =
        await AriesAgent.agent.identifiers.getIdentifier(params.id);
      if (cardDetailsResult) {
        setCardData(cardDetailsResult.result);
      } else {
        // @TODO - Error handling.
      }
    };
    fetchDetails();
  }, [params.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
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
    history.push(backPath.pathname);
  };

  const handleDelete = async () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update identifiers.card.details.options file too.
    if (cardData) {
      const updatedIdentifiers = identifierData.filter(
        (item) => item.id !== cardData.id
      );
      // For now there is no archiving in the UI so does both.
      await AriesAgent.agent.identifiers.archiveIdentifier(cardData.id);
      await AriesAgent.agent.identifiers.deleteIdentifier(cardData.id);
      dispatch(setIdentifiersCache(updatedIdentifiers));
    }
    handleDone();
  };

  const AdditionalButtons = () => {
    const handleSetFavourite = (id: string) => {
      if (isFavourite) {
        PreferencesStorage.set(PreferencesKeys.APP_IDENTIFIERS_FAVOURITES, {
          favourites: favouritesIdentifiersData.filter((fav) => fav.id !== id),
        })
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

        PreferencesStorage.set(PreferencesKeys.APP_IDENTIFIERS_FAVOURITES, {
          favourites: [{ id, time: Date.now() }, ...favouritesIdentifiersData],
        })
          .then(() => {
            dispatch(addFavouriteIdentifierCache({ id, time: Date.now() }));
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
          className="share-button"
          data-testid="share-button"
          onClick={() => {
            setShareIsOpen(true);
          }}
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
          onClick={() => {
            setIdentifierOptionsIsOpen(true);
          }}
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

  return (
    <IonPage className="tab-layout card-details">
      <TabLayout
        header={true}
        title={`${i18n.t("identifiers.card.details.done")}`}
        titleSize="h3"
        titleAction={handleDone}
        menuButton={false}
        additionalButtons={<AdditionalButtons />}
      >
        {!cardData ? (
          <div
            className="spinner-container"
            data-testid="spinner-container"
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
              {cardData.method === IdentifierType.KEY ? (
                <IdentifierCardInfoDid cardData={cardData as DIDDetails} />
              ) : (
                <IdentifierCardInfoKeri cardData={cardData as KERIDetails} />
              )}
              <PageFooter
                pageId={pageId}
                deleteButtonText={`${i18n.t(
                  "identifiers.card.details.delete.button"
                )}`}
                deleteButtonAction={() => {
                  setAlertIsOpen(true);
                  dispatch(
                    setCurrentOperation(OperationType.DELETE_IDENTIFIER)
                  );
                }}
              />
            </div>
          </>
        )}
        {cardData && (
          <ShareIdentifier
            isOpen={shareIsOpen}
            setIsOpen={setShareIsOpen}
            id={cardData.id}
            name={cardData.displayName}
          />
        )}
        {cardData && (
          <IdentifierOptions
            optionsIsOpen={identifierOptionsIsOpen}
            setOptionsIsOpen={setIdentifierOptionsIsOpen}
            cardData={cardData}
            setCardData={setCardData}
          />
        )}
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-confirm"
          headerText={i18n.t("identifiers.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "identifiers.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "identifiers.card.details.delete.alert.cancel"
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
          actionDismiss={() =>
            dispatch(setCurrentOperation(OperationType.IDLE))
          }
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

export { IdentifierCardDetails };
