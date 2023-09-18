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
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { getCredsCache } from "../../../store/reducers/credsCache";
import { Connections } from "../Connections";
import {
  cardTypes,
  connectionStatus,
  connectionType,
  defaultCredentialsCardData,
  toastState,
} from "../../constants/dictionary";
import { ConnectModal } from "../../components/ConnectModal";
import { credentialRequestData } from "../../__fixtures__/connectionsFix";
import { CredProps } from "../../components/CardsStack/CardsStack.types";
import { TOAST_MESSAGE_DELAY } from "../../../constants/appConstants";
import { ColorGenerator } from "../../utils/ColorGenerator";
import { ArchivedCredentials } from "../../components/ArchivedCredentials";
import "./Creds.scss";

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
  const [credsData, setCredsData] = useState<CredProps[]>(
    useAppSelector(getCredsCache)
  );
  const confirmedCreds = credsData.filter((item) => item.isArchived === false);
  const archivedCreds = credsData.filter((item) => item.isArchived === true);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showConnections, setShowConnections] = useState(false);
  const [addCredentialIsOpen, setAddCredentialIsOpen] = useState(false);
  const [archivedCredentialsIsOpen, setArchivedCredentialsIsOpen] =
    useState(false);
  const colorGenerator = new ColorGenerator();
  const newColor = colorGenerator.generateNextColor();

  const handleCreateCred = () => {
    setAddCredentialIsOpen(true);
  };

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }))
  );

  useEffect(() => {
    // @TODO - sdisalvo: This one is listening for pending credential requests
    if (currentOperation === toastState.credentialRequestPending) {
      //
      // Fetch new data - remember to replace "defaultCredentialsCardData" with real values
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      const credentialData = {
        ...defaultCredentialsCardData,
        id: credentialRequestData.id,
        issuanceDate: today.toISOString(),
        issuerLogo: credentialRequestData.profileUrl,
        colors: [newColor[1], newColor[0]],
        isArchived: false,
        status: connectionStatus.pending,
      };
      const newCredsData = [...credsData, credentialData];
      // Update existing creds adding the new one with status "pending"
      setCredsData(newCredsData);
      // Add function here to receive a "state": "completed" from the agent then pass a boolean to the variable below
      const state = true;
      setTimeout(() => {
        // Adding a timeout to wait until the previous toast for pending connection will close
        // also emulating a delay in the response from the agent
        if (state) {
          const updatedData = () => {
            const data = newCredsData;
            for (const i in data) {
              if (data[i].id == credentialData.id) {
                data[i].status = connectionStatus.confirmed;
                break;
              }
            }
            return data;
          };
          // update the state of the displayed connection removing the "pending" label and show toast
          setCredsData(updatedData);
          dispatch(setCurrentOperation(toastState.newCredentialAdded));
        }
      }, TOAST_MESSAGE_DELAY);
    }
  }, [currentOperation]);

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
          {confirmedCreds.length ? (
            <>
              <CardsStack
                cardsType={cardTypes.creds}
                cardsData={confirmedCreds}
              />
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
            </>
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("creds.tab.create")}
              buttonAction={handleCreateCred}
              testId="creds-cards-placeholder"
            />
          )}
          <ConnectModal
            type={connectionType.credential}
            connectModalIsOpen={addCredentialIsOpen}
            setConnectModalIsOpen={setAddCredentialIsOpen}
          />
          {archivedCreds.length && (
            <ArchivedCredentials
              archivedCredentialsIsOpen={archivedCredentialsIsOpen}
              setArchivedCredentialsIsOpen={setArchivedCredentialsIsOpen}
            />
          )}
        </TabLayout>
      </IonPage>
    </>
  );
};

export { Creds };
