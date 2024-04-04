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
import { ConnectionType } from "../../../../core/agent/agent.types";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import DidComLogo from "../../../assets/images/didCommGeneric.jpg";

const IdentifierStage1 = ({
  state,
  setState,
  componentId,
}: IdentifierStageProps) => {
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [selectedConnections, setSelectedConnections] = useState<
    ConnectionShortDetails[]
  >(state.selectedConnections);
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
    }
  }, [connectionsCache, setState]);

  const handleSelectConnection = (connection: ConnectionShortDetails) => {
    let data = selectedConnections;
    if (data.find((item) => item === connection)) {
      data = data.filter((item) => item !== connection);
    } else {
      data = [...selectedConnections, connection];
    }
    setSelectedConnections(data);
  };

  const handleContinue = () => {
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      identifierCreationStage: 2,
      selectedConnections: selectedConnections,
    }));
  };

  const getFallbackLogo = (type?: ConnectionType) =>
    type === ConnectionType.DIDCOMM ? DidComLogo : KeriLogo;

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
                onClick={() => handleSelectConnection(connection)}
                className={`${
                  selectedConnections.includes(connection) &&
                  "selected-connection"
                }`}
              >
                <IonLabel className="connection-item">
                  <img
                    src={connection?.logo || getFallbackLogo(connection?.type)}
                    className="connection-logo"
                    data-testid="identifier-stage-1-logo"
                    alt="connection-logo"
                  />
                  <span className="connection-name">{connection.label}</span>
                  <IonCheckbox
                    checked={selectedConnections.includes(connection)}
                    data-testid={`connection-checkbox-${index}`}
                    onIonChange={() => {
                      handleSelectConnection(connection);
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
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={!selectedConnections.length}
      />
    </>
  );
};

export { IdentifierStage1 };
