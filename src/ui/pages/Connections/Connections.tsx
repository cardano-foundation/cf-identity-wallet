import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonRow,
  IonSearchbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { addOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { i18n } from "../../../i18n";
import {
  ConnectionsComponentProps,
  ConnectionShortDetails,
  MappedConnections,
} from "./Connections.types";
import "./Connections.scss";
import { ConnectModal } from "../../components/ConnectModal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { RequestType } from "../../globals/types";
import { getStateCache } from "../../../store/reducers/stateCache";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { updateReduxState } from "../../../store/utils";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import { ShareQR } from "../../components/ShareQR/ShareQR";
import { MoreOptions } from "../../components/ShareQR/MoreOptions";
import { AlphabeticList } from "./components/AlphabeticList";
import { AlphabetSelector } from "./components/AlphabetSelector";
import { SideSlider } from "../../components/SideSlider";

const Connections = ({
  showConnections,
  setShowConnections,
}: ConnectionsComponentProps) => {
  const pageId = "connections-tab";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [mappedConnections, setMappedConnections] = useState<
    MappedConnections[]
  >([]);
  const [connectModalIsOpen, setConnectModalIsOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string>();
  const [showPlaceholder, setShowPlaceholder] = useState(
    connectionsCache.length === 0
  );

  useEffect(() => {
    const openConnections = (history.location.state as Record<string, any>)
      ?.openConnections;

    if (openConnections) {
      setShowConnections(true);
      history.replace(history.location.pathname, {});
    }
  }, [history.location.state]);

  useEffect(() => {
    setShowPlaceholder(connectionsCache.length === 0);
  }, [connectionsCache]);

  async function handleProvideQr() {
    // TODO: bao-sotatek: define how to provide the QR
    // setInvitationLink(shortUrl);
    setConnectModalIsOpen(false);
  }

  const handleConnectModal = () => {
    setConnectModalIsOpen(true);
  };

  const handleShowConnectionDetails = async (item: ConnectionShortDetails) => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      TabsRoutePath.CREDENTIALS,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: item,
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
        const textA = a.label.toUpperCase();
        const textB = b.label.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      const mapConnections = ((m, a) => (
        a.forEach((s) => {
          const a = m.get(s.label[0]) || [];
          m.set(s.label[0], (a.push(s), a));
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

  return (
    <>
      <SideSlider open={showConnections}>
        <TabLayout
          preventBackButtonEvent={!showConnections}
          pageId={pageId}
          header={true}
          backButton={true}
          customClass={showConnections ? "show" : "hide"}
          backButtonAction={() => setShowConnections(false)}
          title={`${i18n.t("connections.tab.title")}`}
          additionalButtons={<AdditionalButtons />}
          placeholder={
            showPlaceholder && (
              <CardsPlaceholder
                buttonLabel={i18n.t("connections.tab.create")}
                buttonAction={handleConnectModal}
                testId={pageId}
              />
            )
          }
        >
          {!showPlaceholder && (
            <>
              <IonSearchbar
                placeholder={`${i18n.t("connections.tab.searchconnections")}`}
              />
              <div className="connections-tab-center">
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
                                handleShowConnectionDetails={
                                  handleShowConnectionDetails
                                }
                              />
                            </IonItemGroup>
                          );
                        })}
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonContent>
                <AlphabetSelector />
              </div>
            </>
          )}
        </TabLayout>
      </SideSlider>
      <ConnectModal
        type={RequestType.CONNECTION}
        connectModalIsOpen={connectModalIsOpen}
        setConnectModalIsOpen={setConnectModalIsOpen}
        handleProvideQr={handleProvideQr}
      />
      {invitationLink && (
        <ShareQR
          isOpen={!!invitationLink}
          setIsOpen={() => setInvitationLink(undefined)}
          header={{
            title: i18n.t("connectmodal.connect"),
            titlePosition: "center",
          }}
          content={{
            QRData: invitationLink,
            copyBlock: [{ content: invitationLink }],
          }}
          moreComponent={
            <MoreOptions
              onClick={() => setInvitationLink(undefined)}
              text={invitationLink}
            />
          }
          modalOptions={{
            initialBreakpoint: 0.75,
            breakpoints: [0, 0.75],
          }}
        />
      )}
    </>
  );
};

export { Connections };
