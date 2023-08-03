import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonPage,
  IonRow,
  IonSearchbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { i18n } from "../../../i18n";
import { FilteredConnectionsProps } from "./Connections.types";
import { filteredConnections } from "../../__fixtures__/filteredConnections";
import "./Connections.scss";

const AdditionalButtons = () => {
  return (
    <IonButton
      shape="round"
      className="add-button"
      data-testid="add-button"
    >
      <IonIcon
        slot="icon-only"
        icon={addOutline}
        color="primary"
      />
    </IonButton>
  );
};

interface ConnectionItemProps {
  key: number;
  item: FilteredConnectionsProps;
}

const ConnectionItem = ({ item }: ConnectionItemProps) => {
  return <div>{item.issuer}</div>;
};

interface ConnectionsProps {
  setShowConnections: (value: boolean) => void;
}

const Connections = ({ setShowConnections }: ConnectionsProps) => {
  const connections: FilteredConnectionsProps[] = filteredConnections;

  const handleCreateConnection = () => {
    // @TODO - sdisalvo: function to create connection
  };

  return (
    <TabLayout
      data-testid="connections-tab"
      header={true}
      backButton={true}
      backButtonAction={() => setShowConnections(false)}
      title={`${i18n.t("connections.tab.title")}`}
      menuButton={true}
      additionalButtons={<AdditionalButtons />}
    >
      {connections.length ? (
        <>
          <IonSearchbar
            placeholder={`${i18n.t("connections.tab.searchconnections")}`}
          />
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonList
                  lines="none"
                  className="transactions-list"
                  data-testid="transactions-list"
                >
                  {connections.map((connection, index) => {
                    return (
                      <ConnectionItem
                        key={index}
                        item={connection}
                      />
                    );
                  })}
                </IonList>
              </IonCol>
            </IonRow>
          </IonGrid>
        </>
      ) : (
        <CardsPlaceholder
          buttonLabel={i18n.t("connections.tab.create")}
          buttonAction={handleCreateConnection}
        />
      )}
    </TabLayout>
  );
};

export { Connections };
