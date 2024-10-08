import { IonButton, IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { Agent } from "../../../core/agent/agent";
import { ConnectionStatus } from "../../../core/agent/agent.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getConnectionsCache,
  getOpenConnectionId,
  removeConnectionCache,
  setOpenConnectionDetail,
} from "../../../store/reducers/connectionsCache";
import { getIdentifiersCache } from "../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { Alert } from "../../components/Alert";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { RemovePendingAlert } from "../../components/RemovePendingAlert";
import { ShareConnection } from "../../components/ShareConnection";
import { ShareType } from "../../components/ShareConnection/ShareConnection.types";
import { SideSlider } from "../../components/SideSlider";
import { OperationType, RequestType, ToastMsgType } from "../../globals/types";
import { useOnlineStatusEffect } from "../../hooks";
import { useSwipeBack } from "../../hooks/swipeBackHook";
import { showError } from "../../utils/error";
import { ConnectionsBody } from "./components/ConnectionsBody";
import { ConnectionsOptionModal } from "./components/ConnectionsOptionModal";
import { IdentifierSelectorModal } from "./components/IdentifierSelectorModal/IdentifierSelectorModal";
import "./Connections.scss";
import {
  ConnectionsComponentProps,
  ConnectionShortDetails,
  ConnectionsOptionRef,
  MappedConnections,
} from "./Connections.types";
import { combineClassNames } from "../../utils/style";
import { RoutePath } from "../../../routes";

const ANIMATION_TIMEOUT = 350;

const Connections = forwardRef<ConnectionsOptionRef, ConnectionsComponentProps>(
  ({ showConnections, setShowConnections, selfPaginated }, ref) => {
    const pageId = "connections-tab";
    const history = useHistory();
    const dispatch = useAppDispatch();
    const stateCache = useAppSelector(getStateCache);
    const currentOperation = useAppSelector(getCurrentOperation);
    const connectionsCache = useAppSelector(getConnectionsCache);
    const identifierCache = useAppSelector(getIdentifiersCache);
    const openDetailId = useAppSelector(getOpenConnectionId);
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
    const [deletePendingItem, setDeletePendingItem] =
      useState<ConnectionShortDetails | null>(null);
    const [openDeletePendingAlert, setOpenDeletePendingAlert] = useState(false);
    const userName = stateCache.authentication.userName;
    const [oobi, setOobi] = useState("");
    const [hideHeader, setHideHeader] = useState(false);

    const fetchOobi = useCallback(async () => {
      try {
        if (!selectedIdentifier?.id) return;

        const oobiValue = await Agent.agent.connections.getOobi(
          `${selectedIdentifier.id}`,
          userName
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      } catch (e) {
        showError("Unable to fetch connection oobi", e, dispatch);
      }
    }, [selectedIdentifier?.id, userName, dispatch]);

    useOnlineStatusEffect(fetchOobi);

    useEffect(() => {
      setShowPlaceholder(Object.keys(connectionsCache).length === 0);
    }, [connectionsCache]);

    useEffect(() => {
      if (currentOperation === OperationType.BACK_TO_SHARE_CONNECTION) {
        setShowConnections(true);
        dispatch(setCurrentOperation(OperationType.IDLE));
      }
    }, [currentOperation, dispatch, setShowConnections]);

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

    useImperativeHandle(ref, () => ({
      handleConnectModalButton: handleConnectModal,
    }));

    const handleCloseAlert = () => {
      setOpenIdentifierMissingAlert(false);
    };

    const handleShowConnectionDetails = useCallback(
      async (item: ConnectionShortDetails) => {
        if (item.status === ConnectionStatus.PENDING) {
          setDeletePendingItem(item);
          setOpenDeletePendingAlert(true);
          return;
        }

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
      },
      [dispatch, history, stateCache]
    );

    useEffect(() => {
      if (openDetailId === undefined) return;

      setShowConnections(true);
      const connection = connectionsCache[openDetailId];
      dispatch(setOpenConnectionDetail(undefined));

      if (!connection || connection.status === ConnectionStatus.PENDING) return;

      setTimeout(() => {
        handleShowConnectionDetails(connection);
      }, ANIMATION_TIMEOUT);
    }, [
      connectionsCache,
      dispatch,
      handleShowConnectionDetails,
      openDetailId,
      setShowConnections,
      showConnections,
    ]);

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

    const deletePendingCheckProps = useMemo(
      () => ({
        title: i18n.t("connections.tab.detelepending.title"),
        description: i18n.t("connections.tab.detelepending.description"),
        button: i18n.t("connections.tab.detelepending.button"),
      }),
      []
    );

    const deleteConnection = async () => {
      if (!deletePendingItem) return;

      try {
        setDeletePendingItem(null);
        await Agent.agent.connections.deleteStaleLocalConnectionById(
          deletePendingItem.id
        );
        dispatch(setToastMsg(ToastMsgType.CONNECTION_DELETED));
        dispatch(removeConnectionCache(deletePendingItem.id));
      } catch (error) {
        showError(
          "Unable to delete connection",
          error,
          dispatch,
          ToastMsgType.DELETE_CONNECTION_FAIL
        );
      }
      dispatch(setCurrentOperation(OperationType.IDLE));
    };

    const classes = combineClassNames({
      show: showConnections,
      hide: !showConnections,
      "hide-header": hideHeader,
    });

    return (
      <>
        {selfPaginated ? (
          <SideSlider
            renderAsModal
            isOpen={showConnections}
            className={
              history.location.pathname === RoutePath.CONNECTION_DETAILS
                ? "open-detail"
                : undefined
            }
          >
            <TabLayout
              hardwareBackButtonConfig={backHardwareConfig}
              pageId={pageId}
              header={true}
              backButton={true}
              customClass={classes}
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
                <ConnectionsBody
                  onSearchFocus={setHideHeader}
                  mappedConnections={mappedConnections}
                  handleShowConnectionDetails={handleShowConnectionDetails}
                />
              )}
            </TabLayout>
          </SideSlider>
        ) : (
          (showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={i18n.t("connections.tab.create")}
              buttonAction={handleConnectModal}
              testId={pageId}
            />
          )) || (
            <ConnectionsBody
              onSearchFocus={setHideHeader}
              mappedConnections={mappedConnections}
              handleShowConnectionDetails={handleShowConnectionDetails}
            />
          )
        )}
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
          oobi={oobi}
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
        <RemovePendingAlert
          pageId={pageId}
          openFirstCheck={openDeletePendingAlert}
          firstCheckProps={deletePendingCheckProps}
          onClose={() => setOpenDeletePendingAlert(false)}
          secondCheckTitle={`${i18n.t(
            "connections.tab.detelepending.secondchecktitle"
          )}`}
          onDeletePendingItem={deleteConnection}
        />
      </>
    );
  }
);

export { Connections };
