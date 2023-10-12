import {
  IonButton,
  IonIcon,
  IonLabel,
  IonPage,
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
  getCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { Connections } from "../Connections";
import { cardTypes, connectionType } from "../../constants/dictionary";
import { ConnectModal } from "../../components/ConnectModal";
import { ArchivedCredentials } from "../../components/ArchivedCredentials";
import { AriesAgent } from "../../../core/agent/agent";
import { CredentialShortDetails } from "../../components/CardsStack/CardsStack.types";
import { getCredsCache } from "../../../store/reducers/credsCache";

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
        className="add-credential-button"
        data-testid="add-credential-button"
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
  const credsCache = useAppSelector(getCredsCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [currentCreds, setCurrentCreds] = useState<CredentialShortDetails[]>([
    ...credsCache,
  ]);
  const [archivedCreds, setArchivedCreds] = useState<CredentialShortDetails[]>(
    []
  );
  const [showConnections, setShowConnections] = useState(false);
  const [addCredentialIsOpen, setAddCredentialIsOpen] = useState(false);
  const [archivedCredentialsIsOpen, setArchivedCredentialsIsOpen] =
    useState(false);

  const fetchCurrentCreds = async () => {
    try {
      const creds = await AriesAgent.agent.credentials.getCredentials();
      setCurrentCreds(creds);
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
  };

  const fetchArchivedCreds = async () => {
    try {
      const creds = await AriesAgent.agent.credentials.getCredentials(true);
      setArchivedCreds(creds);
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
  };

  useEffect(() => {
    fetchCurrentCreds();
    fetchArchivedCreds();
  }, [archivedCredentialsIsOpen, addCredentialIsOpen, currentOperation]);

  const handleCreateCred = () => {
    setAddCredentialIsOpen(true);
  };

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }));
    fetchCurrentCreds();
    fetchArchivedCreds();
  });

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
              handleConnections={() => setShowConnections(true)}
              handleCreateCred={handleCreateCred}
            />
          }
        >
          {currentCreds.length ? (
            <CardsStack
              cardsType={cardTypes.creds}
              cardsData={currentCreds}
            />
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("creds.tab.create")}
              buttonAction={handleCreateCred}
              testId="creds-cards-placeholder"
            />
          )}
          {archivedCreds.length ? (
            <div className="archived-credentials-button-container">
              <IonButton
                fill="outline"
                className="secondary-button"
                onClick={() => setArchivedCredentialsIsOpen(true)}
              >
                <IonLabel color="secondary">
                  {i18n.t("creds.tab.viewarchived")}
                </IonLabel>
              </IonButton>
            </div>
          ) : null}
          <ConnectModal
            type={connectionType.credential}
            connectModalIsOpen={addCredentialIsOpen}
            setConnectModalIsOpen={setAddCredentialIsOpen}
          />
          {archivedCreds.length ? (
            <ArchivedCredentials
              archivedCredentialsIsOpen={archivedCredentialsIsOpen}
              setArchivedCredentialsIsOpen={setArchivedCredentialsIsOpen}
            />
          ) : null}
        </TabLayout>
      </IonPage>
    </>
  );
};

export { Creds };
