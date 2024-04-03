import { ellipsisVertical, addOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from "@ionic/react";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import "./ConnectionDetails.scss";
import {
  ConnectionDetails as ConnectionData,
  ConnectionShortDetails,
} from "../Connections/Connections.types";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { ConnectionOptions } from "../../components/ConnectionOptions";
import { VerifyPassword } from "../../components/VerifyPassword";
import {
  Alert as AlertDeleteConnection,
  Alert as AlertDeleteNote,
} from "../../components/Alert";
import {
  getConnectionsCache,
  setConnectionsCache,
} from "../../../store/reducers/connectionsCache";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { OperationType, ToastMsgType } from "../../globals/types";
import { AriesAgent } from "../../../core/agent/agent";
import {
  ConnectionHistoryItem,
  ConnectionNoteDetails,
  ConnectionType,
  CredentialType,
} from "../../../core/agent/agent.types";
import ConnectionDetailsHeader from "./components/ConnectionDetailsHeader";
import { EditConnectionsModal } from "./components/EditConnectionsModal";
import { ConnectionDetailsInfoBlock } from "./components/ConnectionDetailsInfoBlock";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import Minicred1 from "../../assets/images/minicred1.jpg";
import Minicred2 from "../../assets/images/minicred2.jpg";
import Minicred3 from "../../assets/images/minicred3.jpg";
import Minicred4 from "../../assets/images/minicred4.jpg";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import DidComLogo from "../../assets/images/didCommGeneric.jpg";

const ConnectionDetails = () => {
  const pageId = "connection-details";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const connectionsData = useAppSelector(getConnectionsCache);
  const connectionShortDetails = history?.location
    ?.state as ConnectionShortDetails;
  const [connectionDetails, setConnectionDetails] = useState<ConnectionData>();
  const [connectionHistory, setConnectionHistory] = useState<
    ConnectionHistoryItem[]
  >([]);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteConnectionIsOpen, setAlertDeleteConnectionIsOpen] =
    useState(false);
  const [alertDeleteNoteIsOpen, setAlertDeleteNoteIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [coreNotes, setCoreNotes] = useState<ConnectionNoteDetails[]>([]);
  const [notes, setNotes] = useState<ConnectionNoteDetails[]>([]);
  const currentNoteId = useRef("");
  const [segmentValue, setSegmentValue] = useState("details");
  const [loading, setLoading] = useState({
    details: false,
    history: false,
  });

  useEffect(() => {
    async function getDetails() {
      try {
        const connectionDetails =
          await AriesAgent.agent.connections.getConnectionById(
            connectionShortDetails.id,
            connectionShortDetails.type
          );
        setConnectionDetails(connectionDetails);
        if (connectionDetails.notes) {
          setCoreNotes(connectionDetails.notes);
          setNotes(connectionDetails.notes);
        }
      } catch (e) {
        // @TODO - Error handling.
      } finally {
        setLoading((value) => ({ ...value, details: false }));
      }
    }

    async function getHistory() {
      try {
        const connectionHistory =
          await AriesAgent.agent.connections.getConnectionHistoryById(
            connectionShortDetails.id
          );
        setConnectionHistory(connectionHistory);
      } catch (e) {
        // @TODO - Error handling.
      } finally {
        setLoading((value) => ({ ...value, history: false }));
      }
    }

    if (connectionShortDetails?.id) {
      setLoading({
        history: true,
        details: true,
      });
      getDetails();
      getHistory();
    }
  }, [connectionShortDetails?.id, modalIsOpen]);

  const handleDone = () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.CONNECTION_DETAILS,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push(nextPath.pathname);
  };

  const handleDelete = () => {
    setOptionsIsOpen(false);
    setAlertDeleteConnectionIsOpen(true);
  };

  const verifyAction = () => {
    async function deleteConnection() {
      await AriesAgent.agent.connections.deleteConnectionById(
        connectionShortDetails.id,
        connectionShortDetails.type
      );
      const updatedConnections = connectionsData.filter(
        (item) => item.id !== connectionDetails?.id
      );
      dispatch(setConnectionsCache(updatedConnections));
      handleDone();
      setVerifyPasswordIsOpen(false);
      setVerifyPasscodeIsOpen(false);
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

  const credentialBackground = () => {
    if (connectionShortDetails?.type === ConnectionType.KERI) {
      return Minicred4;
    } else if (connectionShortDetails?.type === ConnectionType.DIDCOMM) {
      switch (connectionHistory[0]?.credentialType) {
      case CredentialType.PERMANENT_RESIDENT_CARD:
        return Minicred3;
      case CredentialType.ACCESS_PASS_CREDENTIAL:
        return Minicred2;
      default:
        return Minicred1;
      }
    }
  };

  const fallbackLogo =
    connectionDetails?.type === ConnectionType.DIDCOMM ? DidComLogo : KeriLogo;

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

  return (
    <>
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
            actionButtonAction={() => {
              setOptionsIsOpen(true);
            }}
            actionButtonIcon={ellipsisVertical}
          />
        }
      >
        <div className="connection-details-content">
          <ConnectionDetailsHeader
            logo={connectionDetails?.logo || fallbackLogo}
            label={connectionDetails?.label}
            date={connectionDetails?.connectionDate}
          />
          <IonSegment
            data-testid="connection-details-segment"
            value={segmentValue}
            onIonChange={(event) => {
              setSegmentValue(`${event.detail.value}`);
            }}
          >
            <IonSegmentButton
              value="details"
              data-testid="connection-details-segment-button"
            >
              <IonLabel>{`${i18n.t("connections.details.details")}`}</IonLabel>
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
                <ConnectionDetailsInfoBlock
                  key={index}
                  title={infoBlock.title}
                >
                  {infoBlock.value}
                </ConnectionDetailsInfoBlock>
              ))}
              <ConnectionDetailsInfoBlock
                title={i18n.t("connections.details.history")}
              >
                {connectionHistory?.length > 0 && (
                  <div className="connection-details-history-event">
                    <div className="connection-details-logo">
                      <img
                        src={credentialBackground()}
                        alt="credential-miniature"
                        className="credential-miniature"
                      />
                    </div>
                    <p className="connection-details-history-event-info">
                      {i18next.t("connections.details.received", {
                        credential: connectionHistory[0]?.credentialType
                          ?.replace(/([A-Z][a-z])/g, " $1")
                          .replace(/^ /, "")
                          .replace(/(\d)/g, "$1"),
                      })}
                      <span data-testid="connection-history-timestamp">
                        {` ${formatShortDate(
                          connectionHistory[0]?.timestamp
                        )} - ${formatTimeToSec(
                          connectionHistory[0]?.timestamp
                        )}`}
                      </span>
                    </p>
                  </div>
                )}
                <div className="connection-details-history-event">
                  <div className="connection-details-logo">
                    <img
                      src={connectionDetails?.logo || fallbackLogo}
                      alt="connection-logo"
                    />
                  </div>
                  <p className="connection-details-history-event-info">
                    {i18next.t("connections.details.connectedwith", {
                      issuer: connectionDetails?.label,
                    })}
                    <span data-testid="connection-detail-date">
                      {` ${formatShortDate(
                        `${connectionDetails?.connectionDate}`
                      )} - ${formatTimeToSec(
                        `${connectionDetails?.connectionDate}`
                      )}`}
                    </span>
                  </p>
                </div>
              </ConnectionDetailsInfoBlock>
              <PageFooter
                pageId={pageId}
                deleteButtonText={`${i18n.t("connections.details.delete")}`}
                deleteButtonAction={() => {
                  setAlertDeleteConnectionIsOpen(true);
                  dispatch(
                    setCurrentOperation(OperationType.DELETE_CONNECTION)
                  );
                }}
              />
            </div>
          ) : (
            <div
              className="connection-notes-tab"
              data-testid="connection-notes-tab"
            >
              {notes.length > 0 ? (
                <div className="connection-details-info-block">
                  <p>{i18n.t("connections.details.notes")}</p>
                  {notes.map((note, index) => (
                    <div
                      className="connection-details-info-block-inner"
                      key={index}
                    >
                      <div className="connection-details-info-block-line">
                        <p className="connection-details-info-block-note-title">
                          {note.title}
                        </p>
                        <p className="connection-details-info-block-note-message">
                          {note.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="connection-notes-empty">
                  {i18n.t("connections.details.nocurrentnotesext")}
                </p>
              )}
              <PageFooter
                pageId={pageId}
                primaryButtonIcon={notes.length > 0 ? "" : addOutline}
                primaryButtonText={`${
                  notes.length > 0
                    ? i18n.t("connections.details.options.labels.manage")
                    : i18n.t("connections.details.options.labels.add")
                }`}
                primaryButtonAction={() => {
                  setOptionsIsOpen(true);
                }}
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
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={verifyAction}
        />
        <VerifyPasscode
          isOpen={verifyPasscodeIsOpen}
          setIsOpen={setVerifyPasscodeIsOpen}
          onVerify={verifyAction}
        />
      </ScrollablePageLayout>
      {connectionDetails && (
        <EditConnectionsModal
          notes={notes}
          setNotes={setNotes}
          coreNotes={coreNotes}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          currentNoteId={currentNoteId.current}
          connectionDetails={connectionDetails}
          setAlertDeleteNoteIsOpen={setAlertDeleteNoteIsOpen}
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
        actionConfirm={() => {
          if (
            !stateCache?.authentication.passwordIsSkipped &&
            stateCache?.authentication.passwordIsSet
          ) {
            setVerifyPasswordIsOpen(true);
          } else {
            setVerifyPasscodeIsOpen(true);
          }
        }}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
      <AlertDeleteNote
        isOpen={alertDeleteNoteIsOpen}
        setIsOpen={setAlertDeleteNoteIsOpen}
        dataTestId="alert-confirm-delete-note"
        headerText={i18n.t(
          "connections.details.options.alert.deletenote.title"
        )}
        confirmButtonText={`${i18n.t(
          "connections.details.options.alert.deletenote.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "connections.details.options.alert.deletenote.cancel"
        )}`}
        actionConfirm={() => {
          const newNotes = [...notes];
          const noteIndex = newNotes
            .map((el) => el.id)
            .indexOf(currentNoteId.current);
          newNotes.splice(noteIndex, 1);
          setNotes(newNotes);
          dispatch(setToastMsg(ToastMsgType.NOTE_REMOVED));
        }}
        actionCancel={() => {
          setAlertDeleteNoteIsOpen(false);
        }}
        actionDismiss={() => {
          setAlertDeleteNoteIsOpen(false);
        }}
      />
    </>
  );
};

export { ConnectionDetails };
