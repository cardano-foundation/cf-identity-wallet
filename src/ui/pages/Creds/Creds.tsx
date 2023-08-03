import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Creds.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { getCredsCache } from "../../../store/reducers/credsCache";
import { Connections } from "../Connections";

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
  const credsData = useAppSelector(getCredsCache);
  const [showConnections, setShowConnections] = useState(false);

  const handleCreateCred = () => {
    // @TODO - sdisalvo: Function to create Credential
  };

  const handleConnections = () => {
    setShowConnections(!showConnections);
  };

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }))
  );

  return (
    <IonPage
      className={`tab-layout ${
        showConnections ? "connections-tab" : "creds-tab"
      }`}
      data-testid="creds-tab"
    >
      {showConnections ? (
        <Connections setShowConnections={setShowConnections} />
      ) : (
        <>
          <IonMenu contentId="main-content">
            <IonHeader>
              <IonToolbar>
                <IonTitle>Menu Content</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonMenuToggle>
                <IonButton>Click to close the menu</IonButton>
              </IonMenuToggle>
            </IonContent>
          </IonMenu>
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
                cardsType="creds"
                cardsData={credsData}
              />
            ) : (
              <CardsPlaceholder
                buttonLabel={i18n.t("creds.tab.create")}
                buttonAction={handleCreateCred}
              />
            )}
          </TabLayout>
        </>
      )}
    </IonPage>
  );
};

export { Creds };
