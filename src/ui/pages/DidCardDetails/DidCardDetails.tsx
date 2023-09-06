import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  IonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { shareOutline, ellipsisVertical, trashOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../../routes/paths";
import { i18n } from "../../../i18n";
import { DidCard } from "../../components/CardsStack";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { ShareIdentity } from "../../components/ShareIdentity";
import { EditIdentity } from "../../components/EditIdentity";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import {
  getIdentitiesCache,
  setIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import {
  DIDDetails,
  IdentityType,
  KERIDetails,
} from "../../../core/aries/ariesAgent.types";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { DidCardInfoKey } from "../../components/DidCardInfoKey";
import { DidCardInfoKeri } from "../../components/DidCardInfoKeri";

const DidCardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const identitiesData = useAppSelector(getIdentitiesCache);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<
    DIDDetails | KERIDetails | undefined
  >();
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const cardDetailsResult = await AriesAgent.agent.getIdentity(params.id);
      if (cardDetailsResult && cardDetailsResult.type === IdentityType.KEY) {
        setCardData(cardDetailsResult.result);
      } else {
        // @TODO - foconnor: Should put KERI one here when its ready - this was just easier to get the types to work.
        setCardData(undefined);
      }
      // @TODO - Error handling.
    };
    fetchDetails();
  }, [params.id]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.DID_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push(backPath.pathname);
  };

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update EditIdentity file too.
    if (cardData) {
      const updatedIdentities = identitiesData.filter(
        (item) => item.id !== cardData.id
      );
      dispatch(setIdentitiesCache(updatedIdentities));
    }
    handleDone();
  };

  const AdditionalButtons = () => {
    return (
      <>
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
          className="edit-button"
          data-testid="edit-button"
          onClick={() => {
            setEditIsOpen(true);
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
        title={`${i18n.t("dids.card.details.done")}`}
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
            <IonSpinner name="dots" />
          </div>
        ) : (
          <>
            <DidCard
              cardData={cardData}
              isActive={false}
            />
            <div className="card-details-content">
              {cardData.method === IdentityType.KEY ? (
                <DidCardInfoKey
                  cardData={cardData as DIDDetails}
                  setShowToast={setShowToast}
                />
              ) : (
                <DidCardInfoKeri
                  cardData={cardData as KERIDetails}
                  setShowToast={setShowToast}
                />
              )}
              <IonButton
                shape="round"
                expand="block"
                color="danger"
                data-testid="card-details-delete-button"
                className="delete-button"
                onClick={() => setAlertIsOpen(true)}
              >
                <IonIcon
                  slot="icon-only"
                  size="small"
                  icon={trashOutline}
                  color="primary"
                />
                {i18n.t("dids.card.details.delete.button")}
              </IonButton>
            </div>
          </>
        )}
        {cardData && (
          <ShareIdentity
            isOpen={shareIsOpen}
            setIsOpen={setShareIsOpen}
            id={cardData.id}
            name={cardData.displayName}
          />
        )}
        {cardData && (
          <EditIdentity
            isOpen={editIsOpen}
            setIsOpen={setEditIsOpen}
            cardData={cardData}
            setCardData={setCardData}
          />
        )}
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-confirm"
          headerText={i18n.t("dids.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "dids.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "dids.card.details.delete.alert.cancel"
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
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={`${i18n.t("toast.clipboard")}`}
          color="secondary"
          position="top"
          cssClass="confirmation-toast"
          duration={1500}
        />
      </TabLayout>
    </IonPage>
  );
};

export { DidCardDetails };
