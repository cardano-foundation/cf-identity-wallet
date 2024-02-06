import { ellipsisVertical, addOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonLabel, IonSegment, IonSegmentButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../utils/formatters";
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
import { ConnectionNoteDetails } from "../../../core/agent/agent.types";
import ConnectionDetailsHeader from "./components/ConnectionDetailsHeader";
import { EditConnectionsModal } from "./components/EditConnectionsModal";
import { ConnectionDetailsInfoBlock } from "./components/ConnectionDetailsInfoBlock";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";

const ConnectionDetails = () => {
  const pageId = "connection-details";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const connectionsData = useAppSelector(getConnectionsCache);
  const connectionShortDetails = history?.location
    ?.state as ConnectionShortDetails;
  const [connectionDetails, setConnectionDetails] = useState<ConnectionData>();
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

  useEffect(() => {
    async function getDetails() {
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
    }
    if (connectionShortDetails?.id) getDetails();
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
      title: i18n.t("connections.details.goalcodes"),
      value:
        connectionDetails?.goalCode ||
        i18n.t("connections.details.notavailable"),
    },
    {
      title: i18n.t("connections.details.handshake"),
      value:
        connectionDetails?.handshakeProtocols?.toString() ||
        i18n.t("connections.details.notavailable"),
    },
    {
      title: i18n.t("connections.details.attachments"),
      value:
        connectionDetails?.requestAttachments?.toString() ||
        i18n.t("connections.details.notavailable"),
    },
    {
      title: i18n.t("connections.details.endpoints"),
      value:
        connectionDetails?.serviceEndpoints?.toString() ||
        i18n.t("connections.details.notavailable"),
    },
  ];

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
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
            logo={connectionDetails?.logo}
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
