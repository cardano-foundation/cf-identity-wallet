import {
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import { useAppSelector } from "../../../../store/hooks";
import { getConnectionsCache } from "../../../../store/reducers/connectionsCache";
import CardanoLogo from "../../../assets/images/CardanoLogo.jpg";
import { ConnectionType } from "../../../../core/agent/agent.types";

const IdentifierStage1 = ({
  state,
  setState,
  componentId,
}: IdentifierStageProps) => {
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [selectedConnections, setSelectedConnections] = useState<string[]>(
    state.selectedConnections
  );
  const [sortedConnections, setSortedConnections] = useState<
    ConnectionShortDetails[]
  >([]);

  useEffect(() => {
    if (connectionsCache.length) {
      const keriConnections = connectionsCache.filter(
        (connection) => connection.type === ConnectionType.KERI
      );
      const sortedConnections = [...keriConnections].sort(function (a, b) {
        const textA = a.label.toUpperCase();
        const textB = b.label.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      setSortedConnections(sortedConnections);
      setState((prevState: IdentifierStageProps) => ({
        ...prevState,
        sortedConnections: sortedConnections,
      }));
    }
  }, [connectionsCache, setState]);

  const handleSelectConnection = (id: string) => {
    let data = selectedConnections;
    if (data.find((item) => item === id)) {
      data = data.filter((item) => item !== id);
    } else {
      data = [...selectedConnections, id];
    }
    setSelectedConnections(data);
  };

  useEffect(() => {
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      selectedConnections: selectedConnections,
    }));
  }, [selectedConnections, setState]);

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => {
              setState((prevState: IdentifierStageProps) => ({
                ...prevState,
                identifierCreationStage: 0,
                selectedConnections: [],
              }));
            }}
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            title={`${i18n.t("createidentifier.connections.title")}`}
          />
        }
      >
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.connections.subtitle")}
        </p>
        <IonSearchbar
          placeholder={`${i18n.t("createidentifier.connections.search")}`}
        />
        <IonList>
          {sortedConnections.map((connection, index) => {
            return (
              <IonItem
                key={index}
                onClick={() => handleSelectConnection(connection.id)}
                className={`${
                  selectedConnections.includes(connection.id) &&
                  "selected-connection"
                }`}
              >
                <IonLabel className="connection-item">
                  <img
                    src={connection?.logo ?? CardanoLogo}
                    className="connection-logo"
                    alt="connection-logo"
                  />
                  <span className="connection-name">{connection.label}</span>
                  <IonCheckbox
                    checked={selectedConnections.includes(connection.id)}
                    data-testid={`connection-checkbox-${index}`}
                    onIonChange={() => {
                      handleSelectConnection(connection.id);
                    }}
                    aria-label=""
                  />
                </IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        primaryButtonText={`${i18n.t("createidentifier.connections.continue")}`}
        primaryButtonAction={() =>
          setState((prevState: IdentifierStageProps) => ({
            ...prevState,
            identifierCreationStage: 2,
          }))
        }
        primaryButtonDisabled={!selectedConnections.length}
      />
    </>
  );
};

export { IdentifierStage1 };
