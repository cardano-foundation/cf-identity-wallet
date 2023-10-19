import { useHistory, useParams } from "react-router-dom";
import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
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
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { ShareIdentity } from "../../components/ShareIdentity";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import {
  getIdentitiesCache,
  setIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import { AriesAgent } from "../../../core/agent/agent";
import {
  DIDDetails,
  IdentifierType,
  KERIDetails,
} from "../../../core/agent/agent.types";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { IdentityCardInfoKey } from "../../components/IdentityCardInfoKey";
import { IdentityCardInfoKeri } from "../../components/IdentityCardInfoKeri";
import { operationState } from "../../constants/dictionary";
import { IdentityOptions } from "../../components/IdentityOptions";

const DidCardDetails = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const identitiesData = useAppSelector(getIdentitiesCache);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [identityOptionsIsOpen, setIdentityOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const params: { id: string } = useParams();
  const [cardData, setCardData] = useState<
    DIDDetails | KERIDetails | undefined
  >();
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

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

  const handleDelete = async () => {
    setVerifyPasswordIsOpen(false);
    // @TODO - sdisalvo: Update Database.
    // Remember to update identity.card.details.options file too.
    if (cardData) {
      const updatedIdentities = identitiesData.filter(
        (item) => item.id !== cardData.id
      );
      await AriesAgent.agent.identifiers.archiveIdentifier(cardData.id);
      await AriesAgent.agent.identifiers.deleteIdentifier(cardData.id);
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
          className="identity-options-button"
          data-testid="identity-options-button"
          onClick={() => {
            setIdentityOptionsIsOpen(true);
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
        title={`${i18n.t("identity.card.details.done")}`}
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
            <DidCard
              cardData={cardData}
              isActive={false}
            />
            <div className="card-details-content">
              {cardData.method === IdentifierType.KEY ? (
                <IdentityCardInfoKey cardData={cardData as DIDDetails} />
              ) : (
                <IdentityCardInfoKeri cardData={cardData as KERIDetails} />
              )}
              <IonButton
                shape="round"
                expand="block"
                color="danger"
                data-testid="card-details-delete-button"
                className="delete-button"
                onClick={() => {
                  setAlertIsOpen(true);
                  dispatch(setCurrentOperation(operationState.deleteIdentity));
                }}
              >
                <IonIcon
                  slot="icon-only"
                  size="small"
                  icon={trashOutline}
                  color="primary"
                />
                {i18n.t("identity.card.details.delete.button")}
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
          <IdentityOptions
            optionsIsOpen={identityOptionsIsOpen}
            setOptionsIsOpen={setIdentityOptionsIsOpen}
            cardData={cardData}
            setCardData={setCardData}
          />
        )}
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-confirm"
          headerText={i18n.t("identity.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "identity.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "identity.card.details.delete.alert.cancel"
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

export { DidCardDetails };
