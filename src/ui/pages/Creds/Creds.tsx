import {
  IonButton,
  IonIcon,
  IonPage,
  IonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Creds.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentRoute,
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { getCredsCache } from "../../../store/reducers/credsCache";
import { Connections } from "../Connections";
import { cardTypes, toastState } from "../../constants/dictionary";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";

interface AdditionalButtonsProps {
  handleCreateCred: () => void;
  handleConnections: () => void;
}

const AdditionalButtons = ({
  handleCreateCred,
  handleConnections,
}: AdditionalButtonsProps) => {
  return (
    <>
      <IonButton
        shape="round"
        className="connections-button"
        data-testid="connections-button"
        onClick={handleConnections}
      >
        <IonIcon
          slot="icon-only"
          icon={peopleOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
        onClick={handleCreateCred}
      >
        <IonIcon
          slot="icon-only"
          icon={addOutline}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const Creds = () => {
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentRoute = useAppSelector(getCurrentRoute);
  const credsData = useAppSelector(getCredsCache);
  const [showConnections, setShowConnections] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCreateCred = () => {
    // @TODO - sdisalvo: Function to create Credential
  };

  const handleConnections = () => {
    setShowConnections(!showConnections);
  };

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }))
  );

  useEffect(() => {
    if (
      stateCache.currentOperation === toastState.credentialDeleted &&
      currentRoute?.path === TabsRoutePath.CREDS
    ) {
      setShowToast(true);
    }
  }, [stateCache.currentOperation, currentRoute]);

  return (
    <>
      <IonPage
        className={`tab-layout connections-tab ${
          showConnections ? "show" : "hide"
        }`}
        data-testid="connections-tab"
      >
        <Connections setShowConnections={setShowConnections} />
      </IonPage>
      <IonPage
        className="tab-layout creds-tab"
        data-testid="creds-tab"
      >
        <TabLayout
          header={true}
          title={`${i18n.t("creds.tab.title")}`}
          menuButton={true}
          additionalButtons={
            <AdditionalButtons
              handleCreateCred={handleCreateCred}
              handleConnections={handleConnections}
            />
          }
        >
          {credsData.length ? (
            <CardsStack
              cardsType={cardTypes.creds}
              cardsData={credsData}
            />
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("creds.tab.create")}
              buttonAction={handleCreateCred}
              testId="creds-cards-placeholder"
            />
          )}
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setShowToast(false);
              dispatch(setCurrentOperation(""));
            }}
            message={`${i18n.t("toast.credentialDeleted")}`}
            color="secondary"
            position="top"
            cssClass="confirmation-toast"
            duration={1500}
          />
        </TabLayout>
      </IonPage>
    </>
  );
};

export { Creds };
