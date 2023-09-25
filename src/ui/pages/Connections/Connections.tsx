import {
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonRow,
  IonSearchbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { addOutline, hourglassOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { i18n } from "../../../i18n";
import {
  ConnectionItemProps,
  ConnectionsComponentProps,
  ConnectionShortDetails,
  MappedConnections,
} from "./Connections.types";
import "./Connections.scss";
import { formatShortDate } from "../../../utils";
import { ConnectModal } from "../../components/ConnectModal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { connectionStatus, connectionType } from "../../constants/dictionary";
import { getStateCache } from "../../../store/reducers/stateCache";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { updateReduxState } from "../../../store/utils";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import { AriesAgent } from "../../../core/aries/ariesAgent";

const ConnectionItem = ({
  item,
  handleShowConnectionDetails,
}: ConnectionItemProps) => {
  return (
    <IonItem onClick={() => handleShowConnectionDetails(item)}>
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
            size="6.25"
            className="connection-info"
          >
            <IonLabel className="connection-name">{item?.issuer}</IonLabel>
            <IonLabel className="connection-date">
              {formatShortDate(`${item?.issuanceDate}`)}
            </IonLabel>
          </IonCol>
          <IonCol
            size="3.5"
            className="item-status"
          >
            {item.status === connectionStatus.pending ? (
              <IonChip>
                <IonIcon
                  icon={hourglassOutline}
                  color="primary"
                ></IonIcon>
                <span>{item.status}</span>
              </IonChip>
            ) : null}
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

const Connections = ({ setShowConnections }: ConnectionsComponentProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [mappedConnections, setMappedConnections] = useState<
    MappedConnections[]
  >([]);
  const [ConnectModalIsOpen, setConnectModalIsOpen] = useState(false);

  const handleConnectModal = () => {
    setConnectModalIsOpen(true);
  };

  const handleShowConnectionDetails = async (item: ConnectionShortDetails) => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.CREDS, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: await AriesAgent.agent.getConnectionById(item.id),
    });
  };

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-connection-button"
        onClick={handleConnectModal}
      >
        <IonIcon
          slot="icon-only"
          icon={addOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  useEffect(() => {
    if (connectionsCache.length) {
      const sortedConnections = [...connectionsCache].sort(function (a, b) {
        const textA = a.issuer.toUpperCase();
        const textB = b.issuer.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      const mapConnections = ((m, a) => (
        a.forEach((s) => {
          const a = m.get(s.issuer[0]) || [];
          m.set(s.issuer[0], (a.push(s), a));
        }),
        m
      ))(new Map(), sortedConnections);

      const mapToArray = Array.from(mapConnections, ([key, value]) => ({
        key,
        value,
      }));
      setMappedConnections(mapToArray);
    }
  }, [connectionsCache]);

  const AlphabeticList = ({ items }: { items: ConnectionShortDetails[] }) => {
    return (
      <>
        {items.map((connection, index) => {
          return (
            <ConnectionItem
              key={index}
              item={connection}
              handleShowConnectionDetails={handleShowConnectionDetails}
            />
          );
        })}
      </>
    );
  };

  const alphabet = new Array(26)
    .fill(1)
    .map((_, i) => String.fromCharCode(65 + i))
    .concat("#");

  const handleClickScroll = (letter: string) => {
    const element = document.getElementById(letter);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <TabLayout
      header={true}
      backButton={true}
      backButtonAction={() => setShowConnections(false)}
      title={`${i18n.t("connections.tab.title")}`}
      menuButton={true}
      additionalButtons={<AdditionalButtons />}
    >
      {connectionsCache.length ? (
        <>
          <IonSearchbar
            placeholder={`${i18n.t("connections.tab.searchconnections")}`}
          />
          <div className="alphabet-selector">
            {alphabet.map((letter, index) => {
              return (
                <IonButton
                  slot="fixed"
                  onClick={() => handleClickScroll(letter)}
                  key={index}
                  color="transparent"
                >
                  {letter}
                </IonButton>
              );
            })}
          </div>
          <IonContent className="connections-container">
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  {mappedConnections.map((alphabeticGroup, index) => {
                    return (
                      <IonItemGroup
                        className="connections-list"
                        key={index}
                      >
                        <IonItemDivider id={alphabeticGroup.key}>
                          <IonLabel>{alphabeticGroup.key}</IonLabel>
                        </IonItemDivider>
                        <AlphabeticList
                          items={Array.from(alphabeticGroup.value)}
                        />
                      </IonItemGroup>
                    );
                  })}
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
          <ConnectModal
            type={connectionType.connection}
            ConnectModalIsOpen={ConnectModalIsOpen}
            setConnectModalIsOpen={setConnectModalIsOpen}
          />
        </>
      ) : (
        <CardsPlaceholder
          buttonLabel={i18n.t("connections.tab.create")}
          buttonAction={handleConnectModal}
          testId="connections-cards-placeholder"
        />
      )}
    </TabLayout>
  );
};

export { Connections };
