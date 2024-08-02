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
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { t } from "i18next";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import {
  getCurrentOperation,
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { SideSlider } from "../../components/SideSlider";
import { OperationType, RequestType } from "../../globals/types";
import { useSwipeBack } from "../../hooks/swipeBackHook";
import { AlphabeticList } from "./components/AlphabeticList";
import { AlphabetSelector } from "./components/AlphabetSelector";
import { ConnectionsOptionModal } from "./components/ConnectionsOptionModal";
import { IdentifierSelectorModal } from "./components/IdentifierSelectorModal/IdentifierSelectorModal";
import "./Connections.scss";
import {
  ConnectionsComponentProps,
  ConnectionShortDetails,
  MappedConnections,
} from "./Connections.types";
import { ShareConnection } from "../../components/ShareConnection";
import { ShareType } from "../../components/ShareConnection/ShareConnection.types";
import { getIdentifiersCache } from "../../../store/reducers/identifiersCache";
import { Alert } from "../../components/Alert";

const Connections = ({
  showConnections,
  setShowConnections,
}: ConnectionsComponentProps) => {
  const pageId = "connections-tab";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const identifierCache = useAppSelector(getIdentifiersCache);
  const availableIdentifiers = identifierCache.filter(
    (item) => !item.isPending
  );
  const [mappedConnections, setMappedConnections] = useState<
    MappedConnections[]
  >([]);
  const [connectModalIsOpen, setConnectModalIsOpen] = useState(false);
  const [openIdentifierSelector, setOpenIdentifierSelector] = useState(false);
  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierShortDetails | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(
    Object.keys(connectionsCache)?.length === 0
  );
  const [openIdentifierMissingAlert, setOpenIdentifierMissingAlert] =
    useState<boolean>(false);

  useEffect(() => {
    const openConnections = (history.location.state as Record<string, unknown>)
      ?.openConnections;

    if (openConnections) {
      setShowConnections(true);
      history.replace(history.location.pathname, {});
    }
  }, [history, history.location.state, setShowConnections]);

  useEffect(() => {
    setShowPlaceholder(Object.keys(connectionsCache).length === 0);
  }, [connectionsCache]);

  useEffect(() => {
    if (currentOperation === OperationType.BACK_TO_SHARE_CONNECTION) {
      setShowConnections(true);
      setCurrentOperation(OperationType.IDLE);
    }
  }, [currentOperation]);

  const handleNavToCreateKeri = () => {
    setOpenIdentifierMissingAlert(false);
    history.location.pathname === TabsRoutePath.IDENTIFIERS &&
      dispatch(
        setCurrentOperation(
          OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_IDENTIFIERS
        )
      );
    history.location.pathname === TabsRoutePath.CREDENTIALS &&
      dispatch(
        setCurrentOperation(
          OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_CREDENTIALS
        )
      ) &&
      history.push(TabsRoutePath.IDENTIFIERS);
  };

  const handleProvideQr = () => {
    availableIdentifiers.length
      ? setOpenIdentifierSelector(true)
      : setOpenIdentifierMissingAlert(true);
  };

  const handleConnectModal = () => {
    setConnectModalIsOpen(true);
  };

  const handleCloseAlert = () => {
    setOpenIdentifierMissingAlert(false);
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
    const connections = Object.values(connectionsCache);
    if (connections.length) {
      const sortedConnections = [...connections].sort(function (a, b) {
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

  const backHardwareConfig = useMemo(
    () => ({
      prevent: !showConnections,
    }),
    [showConnections]
  );

  const getConnectionsTab = useCallback(() => {
    return document.getElementById(pageId);
  }, []);

  const canStart = useCallback(() => {
    return showConnections;
  }, [showConnections]);

  useSwipeBack(getConnectionsTab, canStart, () => setShowConnections(false));

  return (
    <>
      <SideSlider isOpen={showConnections}>
        <TabLayout
          hardwareBackButtonConfig={backHardwareConfig}
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
          )}
        </TabLayout>
      </SideSlider>
      <ConnectionsOptionModal
        type={RequestType.CONNECTION}
        connectModalIsOpen={connectModalIsOpen}
        setConnectModalIsOpen={setConnectModalIsOpen}
        handleProvideQr={handleProvideQr}
      />
      <IdentifierSelectorModal
        open={openIdentifierSelector}
        setOpen={setOpenIdentifierSelector}
        onSubmit={setSelectedIdentifier}
      />
      <ShareConnection
        isOpen={!!selectedIdentifier}
        setIsOpen={() => setSelectedIdentifier(null)}
        signifyName={selectedIdentifier?.signifyName}
        shareType={ShareType.Connection}
      />
      <Alert
        isOpen={openIdentifierMissingAlert}
        setIsOpen={setOpenIdentifierMissingAlert}
        dataTestId="alert-create-keri"
        headerText={i18n.t("connections.tab.alert.message")}
        confirmButtonText={`${i18n.t("connections.tab.alert.confirm")}`}
        cancelButtonText={`${i18n.t("connections.tab.alert.cancel")}`}
        actionConfirm={handleNavToCreateKeri}
        actionCancel={handleCloseAlert}
        actionDismiss={handleCloseAlert}
      />
    </>
  );
};

export { Connections };
