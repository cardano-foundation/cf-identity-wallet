import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSearchbar,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { i18n } from "../../../i18n";
import {
  ConnectionItemProps,
  ConnectionsComponentProps,
  FilteredConnectionsProps,
} from "./Connections.types";
import { filteredConnections } from "../../__fixtures__/filteredConnections";
import "./Connections.scss";
import { formatLongDate } from "../../../utils";

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

const ConnectionItem = ({ item }: ConnectionItemProps) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="connection-logo"
          >
            <img
              src={item?.issuerLogo}
              alt="connection-logo"
            />
          </IonCol>
          <IonCol
            size="5.5"
            className="connection-info"
          >
            <IonLabel className="connection-name">{item?.issuer}</IonLabel>
            <IonLabel className="connection-date">
              {formatLongDate(`${item?.issuanceDate}`)}
            </IonLabel>
          </IonCol>
          <IonCol
            size="4"
            className="item-status"
          >
            <IonLabel>Status</IonLabel>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

const Connections = ({ setShowConnections }: ConnectionsComponentProps) => {
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
                  className="connections-list"
                  data-testid="connections-list"
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
