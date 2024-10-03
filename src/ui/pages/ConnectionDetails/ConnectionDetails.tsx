import { ellipsisVertical } from "ionicons/icons";
import { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../utils/formatters";
import "./ConnectionDetails.scss";

import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { ConnectionOptions } from "../../components/ConnectionOptions";
import { Alert as AlertDeleteConnection } from "../../components/Alert";
import { removeConnectionCache } from "../../../store/reducers/connectionsCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import { Agent } from "../../../core/agent/agent";
import {
  ConnectionDetails as ConnectionData,
  ConnectionShortDetails,
  ConnectionHistoryItem,
  ConnectionNoteDetails,
} from "../../../core/agent/agent.types";
import ConnectionDetailsHeader from "./components/ConnectionDetailsHeader";
import { EditConnectionsModal } from "./components/EditConnectionsModal";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { CardDetailsBlock } from "../../components/CardDetails";
import { ConnectionNotes } from "./components/ConnectionNotes";
import { useAppIonRouter, useOnlineStatusEffect } from "../../hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { ConnectionHistoryEvent } from "./components/ConnectionHistoryEvent";
import { Verification } from "../../components/Verification";
import { CloudError } from "../../components/CloudError";
import { showError } from "../../utils/error";

const ConnectionDetails = () => {
  const pageId = "connection-details";
  const ionicRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const connectionShortDetails = history?.location
    ?.state as ConnectionShortDetails;
  const [connectionDetails, setConnectionDetails] = useState<ConnectionData>();
  const [connectionHistory, setConnectionHistory] = useState<
    ConnectionHistoryItem[]
  >([]);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteConnectionIsOpen, setAlertDeleteConnectionIsOpen] =
    useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [notes, setNotes] = useState<ConnectionNoteDetails[]>([]);
  const [segmentValue, setSegmentValue] = useState("details");
  const [loading, setLoading] = useState({
    details: false,
    history: false,
  });
  const [cloudError, setCloudError] = useState(false);

  const getDetails = useCallback(async () => {
    if (!connectionShortDetails?.id) return;

    try {
      const connectionDetails = await Agent.agent.connections.getConnectionById(
        connectionShortDetails.id
      );
      setConnectionDetails(connectionDetails);
      if (connectionDetails.notes) {
        setNotes(connectionDetails.notes);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(Agent.MISSING_DATA_ON_KERIA)
      ) {
        setCloudError(true);
      } else {
        handleDone();
        showError("Unable to get connection details", error, dispatch);
      }
    } finally {
      setLoading((value) => ({ ...value, details: false }));
    }
  }, [connectionShortDetails?.id, dispatch]);

  const getHistory = useCallback(async () => {
    if (!connectionShortDetails?.id) return;

    try {
      const connectionHistory =
        await Agent.agent.connections.getConnectionHistoryById(
          connectionShortDetails.id
        );
      setConnectionHistory(connectionHistory);
    } catch (e) {
      handleDone();
      showError("Unable to get connection history", e, dispatch);
    } finally {
      setLoading((value) => ({ ...value, history: false }));
    }
  }, [connectionShortDetails?.id, dispatch]);

  const getData = useCallback(() => {
    if (!connectionShortDetails?.id) return;

    setLoading({
      history: true,
      details: true,
    });

    getDetails();
    getHistory();
  }, [connectionShortDetails?.id, getDetails, getHistory]);

  useOnlineStatusEffect(getData);

  const handleDone = () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.CONNECTION_DETAILS,
      data
    );

    updateReduxState(backPath.pathname, data, dispatch, updateRedux);
    ionicRouter.goBack();
  };

  const handleDelete = () => {
    setOptionsIsOpen(false);
    setAlertDeleteConnectionIsOpen(true);
  };

  const verifyAction = () => {
    async function deleteConnection() {
      try {
        if (cloudError) {
          await Agent.agent.connections.deleteStaleLocalConnectionById(
            connectionShortDetails.id
          );
        } else {
          await Agent.agent.connections.deleteConnectionById(
            connectionShortDetails.id
          );
        }
        dispatch(setToastMsg(ToastMsgType.CONNECTION_DELETED));
        dispatch(removeConnectionCache(connectionShortDetails.id));
        handleDone();
        setVerifyIsOpen(false);
      } catch (error) {
        showError(
          "Unable to delete connection",
          error,
          dispatch,
          ToastMsgType.DELETE_CONNECTION_FAIL
        );
      }
      dispatch(setCurrentOperation(OperationType.IDLE));
    }
    deleteConnection();
  };

  const connectionDetailsData = [
    {
      title: i18n.t("connections.details.label"),
      value: connectionDetails?.label,
    },
    {
      title: i18n.t("connections.details.date"),
      value: formatShortDate(`${connectionDetails?.connectionDate}`),
    },
    {
      title: i18n.t("connections.details.endpoints"),
      value:
        connectionDetails?.serviceEndpoints?.toString() ||
        i18n.t("connections.details.notavailable"),
    },
  ];

  if (loading.details || loading.history) {
    return (
      <div
        className="connection-detail-spinner-container"
        data-testid="connection-detail-spinner-container"
      >
        <IonSpinner name="circular" />
      </div>
    );
  }

  const deleteButtonAction = () => {
    setAlertDeleteConnectionIsOpen(true);
    dispatch(setCurrentOperation(OperationType.DELETE_CONNECTION));
  };

  const handleAuthentication = () => {
    setVerifyIsOpen(true);
  };

  const handleOpenNoteManageModal = () => {
    setModalIsOpen(true);
  };

  const cancelDeleteConnection = () =>
    dispatch(setCurrentOperation(OperationType.IDLE));

  return (
    <>
      {cloudError ? (
        <CloudError
          pageId={pageId}
          header={
            <PageHeader
              closeButton={true}
              closeButtonAction={handleDone}
              closeButtonLabel={`${i18n.t("connections.details.done")}`}
              currentPath={RoutePath.CONNECTION_DETAILS}
            />
          }
        >
          <PageFooter
            pageId={pageId}
            deleteButtonText={`${i18n.t("connections.details.delete")}`}
            deleteButtonAction={() => deleteButtonAction()}
          />
        </CloudError>
      ) : (
        <ScrollablePageLayout
          pageId={pageId}
          customClass="item-details-page"
          header={
            <PageHeader
              closeButton={true}
              closeButtonAction={handleDone}
              closeButtonLabel={`${i18n.t("connections.details.done")}`}
              currentPath={RoutePath.CONNECTION_DETAILS}
              actionButton={true}
              actionButtonAction={() => setOptionsIsOpen(true)}
              actionButtonIcon={ellipsisVertical}
            />
          }
        >
          <div className="connection-details-content">
            <ConnectionDetailsHeader
              logo={connectionDetails?.logo || KeriLogo}
              label={connectionDetails?.label}
              date={connectionDetails?.connectionDate}
            />
            <IonSegment
              data-testid="connection-details-segment"
              value={segmentValue}
              onIonChange={(event) => setSegmentValue(`${event.detail.value}`)}
            >
              <IonSegmentButton
                value="details"
                data-testid="connection-details-segment-button"
              >
                <IonLabel>{`${i18n.t(
                  "connections.details.details"
                )}`}</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton
                value="notes"
                data-testid="connection-notes-segment-button"
              >
                <IonLabel>{`${i18n.t("connections.details.notes")}`}</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            {segmentValue === "details" ? (
              <div
                className="connection-details-tab"
                data-testid="connection-details-tab"
              >
                {connectionDetailsData.map((infoBlock, index) => (
                  <CardDetailsBlock
                    className="connection-details-card"
                    key={index}
                    title={infoBlock.title}
                  >
                    {typeof infoBlock.value === "string" ? (
                      <IonText>{infoBlock.value}</IonText>
                    ) : (
                      infoBlock.value
                    )}
                  </CardDetailsBlock>
                ))}
                <CardDetailsBlock
                  className="connection-details-history"
                  title={i18n.t("connections.details.history")}
                >
                  {connectionHistory?.length > 0 &&
                    connectionHistory
                      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                      .map(
                        (historyItem: ConnectionHistoryItem, index: number) => (
                          <ConnectionHistoryEvent
                            key={index}
                            index={index}
                            historyItem={historyItem}
                            connectionDetails={connectionDetails}
                          />
                        )
                      )}
                  <ConnectionHistoryEvent
                    connectionDetails={connectionDetails}
                  />
                </CardDetailsBlock>
                <PageFooter
                  pageId={pageId}
                  deleteButtonText={`${i18n.t("connections.details.delete")}`}
                  deleteButtonAction={() => deleteButtonAction()}
                />
              </div>
            ) : (
              <div
                className="connection-notes-tab"
                data-testid="connection-notes-tab"
              >
                <ConnectionNotes
                  notes={notes}
                  pageId={pageId}
                  onOptionButtonClick={handleOpenNoteManageModal}
                />
              </div>
            )}
          </div>
          <ConnectionOptions
            optionsIsOpen={optionsIsOpen}
            setOptionsIsOpen={setOptionsIsOpen}
            handleEdit={setModalIsOpen}
            handleDelete={handleDelete}
          />
        </ScrollablePageLayout>
      )}
      {connectionDetails && (
        <EditConnectionsModal
          notes={notes}
          setNotes={setNotes}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          connectionDetails={connectionDetails}
          onConfirm={getDetails}
        />
      )}
      <AlertDeleteConnection
        isOpen={alertDeleteConnectionIsOpen}
        setIsOpen={setAlertDeleteConnectionIsOpen}
        dataTestId="alert-confirm-delete-connection"
        headerText={i18n.t(
          "connections.details.options.alert.deleteconnection.title"
        )}
        confirmButtonText={`${i18n.t(
          "connections.details.options.alert.deleteconnection.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "connections.details.options.alert.deleteconnection.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={cancelDeleteConnection}
        actionDismiss={cancelDeleteConnection}
      />
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={verifyAction}
      />
    </>
  );
};

export { ConnectionDetails };
