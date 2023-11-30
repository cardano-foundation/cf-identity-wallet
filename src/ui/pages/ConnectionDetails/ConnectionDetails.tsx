import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { ellipsisVertical, trashOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../utils/formatters";
import "./ConnectionDetails.scss";
import {
  ConnectionDetails as ConnectionData,
  ConnectionShortDetails,
} from "../Connections/Connections.types";
import { PageLayout } from "../../components/layout/PageLayout";
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
import { InfoBlockProps } from "./ConnectionDetails.types";
import { ConnectionNoteDetails } from "../../../core/agent/agent.types";
import ConnectionDetailsHeader from "./components/ConnectionDetailsHeader";
import { EditConnectionsModal } from "./components/EditConnectionsModal";

const ConnectionDetails = () => {
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
        setNotes(structuredClone(connectionDetails.notes));
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

  const ConnectionDetailsInfoBlock = ({ title, children }: InfoBlockProps) => {
    return (
      <div className="connection-details-info-block">
        <h3>{title}</h3>
        <div className="connection-details-info-block-inner">
          <div className="connection-details-info-block-line">
            <div className="connection-details-info-block-data">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <IonPage
      className="page-layout connection-details"
      data-testid="connection-details-page"
    >
      <PageLayout
        header={true}
        title={""}
        closeButton={true}
        closeButtonAction={handleDone}
        closeButtonLabel={`${i18n.t("connections.details.done")}`}
        currentPath={RoutePath.CONNECTION_DETAILS}
        actionButton={true}
        actionButtonAction={() => {
          setOptionsIsOpen(true);
        }}
        actionButtonIcon={ellipsisVertical}
      >
        <div className="connection-details-content">
          <ConnectionDetailsHeader
            logo={connectionDetails?.logo}
            label={connectionDetails?.label}
            date={connectionDetails?.connectionDate}
          />
          {connectionDetailsData.map((infoBlock, index) => (
            <ConnectionDetailsInfoBlock
              key={index}
              title={infoBlock.title}
            >
              {infoBlock.value}
            </ConnectionDetailsInfoBlock>
          ))}
          {notes.length > 0 ? (
            <div className="connection-details-info-block">
              <h3>{i18n.t("connections.details.notes")}</h3>
              {notes.map((note, index) => (
                <div
                  className="connection-details-info-block-inner"
                  key={index}
                >
                  <div className="connection-details-info-block-line">
                    <div className="connection-details-info-block-note-title">
                      {note.title}
                    </div>
                    <div className="connection-details-info-block-note-message">
                      {note.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <IonButton
            shape="round"
            expand="block"
            color="danger"
            data-testid="connection-details-delete-button"
            className="delete-button"
            onClick={() => {
              setAlertDeleteConnectionIsOpen(true);
              dispatch(setCurrentOperation(OperationType.DELETE_CONNECTION));
            }}
          >
            <IonIcon
              slot="icon-only"
              size="small"
              icon={trashOutline}
              color="primary"
            />
            {i18n.t("connections.details.delete")}
          </IonButton>
        </div>
        <ConnectionOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          handleEdit={setModalIsOpen}
          handleDelete={handleDelete}
        />
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
          actionDismiss={() =>
            dispatch(setCurrentOperation(OperationType.IDLE))
          }
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
      </PageLayout>
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
    </IonPage>
  );
};

export { ConnectionDetails };
