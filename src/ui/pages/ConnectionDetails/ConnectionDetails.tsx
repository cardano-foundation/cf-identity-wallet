import {
  IonButton,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonTextarea,
} from "@ionic/react";
import { ellipsisVertical, trashOutline, createOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";
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
import { operationState, toastState } from "../../constants/dictionary";
import { AriesAgent } from "../../../core/agent/agent";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";
import { InfoBlockProps, NotesProps } from "./ConnectionDetails.types";

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
  const [coreNotes, setCoreNotes] = useState<NotesProps[]>([]);
  const [notes, setNotes] = useState<NotesProps[]>([]);
  const currentNoteId = useRef("");
  const TEMP_ID_PREFIX = "temp";

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

  const ConnectionDetailsHeader = () => {
    return (
      <div className="connection-details-header">
        <div className="connection-details-logo">
          <img
            src={connectionDetails?.logo ?? CardanoLogo}
            alt="connection-logo"
          />
        </div>
        <span className="connection-details-issuer">
          {connectionDetails?.label}
        </span>
        <span className="connection-details-date">
          {formatShortDate(`${connectionDetails?.connectionDate}`)}
        </span>
      </div>
    );
  };

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

  const Note = ({ title, message, id }: NotesProps) => {
    const [newTitle, setNewTitle] = useState(title);
    const [newMessage, setNewMessage] = useState(message);
    const TITLE_MAX_LENGTH = 64;
    const MESSAGE_MAX_LENGTH = 576;

    return (
      <div className="connection-details-info-block-inner">
        <div className="connection-details-info-block-line">
          <div className="connection-details-info-block-data">
            <div className="connection-details-info-block-title">
              <span>{i18n.t("connections.details.title")}</span>
              <span>
                {newTitle.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <IonInput
              data-testid={`edit-connections-modal-note-title-${id}`}
              onIonChange={(e) => setNewTitle(`${e.target.value ?? ""}`)}
              onIonBlur={() => {
                const newNotes = [...notes];
                const noteIndex = newNotes.map((el) => el.id).indexOf(id);
                newNotes[noteIndex].title = newTitle;
              }}
              value={newTitle}
            />
          </div>
          <div className="connection-details-info-block-data">
            <div className="connection-details-info-block-title">
              <span>{i18n.t("connections.details.message")}</span>
              <span>
                {newMessage.length}/{MESSAGE_MAX_LENGTH}
              </span>
            </div>
            <IonTextarea
              autoGrow={true}
              data-testid={`edit-connections-modal-note-message-${id}`}
              onIonChange={(e) => setNewMessage(`${e.target.value ?? ""}`)}
              onIonBlur={() => {
                const newNotes = [...notes];
                const noteIndex = newNotes.map((el) => el.id).indexOf(id);
                newNotes[noteIndex].message = newMessage;
              }}
              value={newMessage}
            />
          </div>
        </div>
        <div className="connection-details-delete-note">
          <IonButton
            shape="round"
            color={"danger"}
            onClick={() => {
              currentNoteId.current = id;
              setAlertDeleteNoteIsOpen(true);
            }}
          >
            <IonIcon
              slot="icon-only"
              icon={trashOutline}
            />
          </IonButton>
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
          <ConnectionDetailsHeader />
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.label")}
          >
            {connectionDetails?.label}
          </ConnectionDetailsInfoBlock>
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.date")}
          >
            {formatShortDate(`${connectionDetails?.connectionDate}`)}
          </ConnectionDetailsInfoBlock>
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.goalcodes")}
          >
            {connectionDetails?.goalCode ||
              i18n.t("connections.details.notavailable")}
          </ConnectionDetailsInfoBlock>
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.handshake")}
          >
            {connectionDetails?.handshakeProtocols?.toString() ||
              i18n.t("connections.details.notavailable")}
          </ConnectionDetailsInfoBlock>
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.attachments")}
          >
            {connectionDetails?.requestAttachments?.toString() ||
              i18n.t("connections.details.notavailable")}
          </ConnectionDetailsInfoBlock>
          <ConnectionDetailsInfoBlock
            title={i18n.t("connections.details.endpoints")}
          >
            {connectionDetails?.serviceEndpoints?.toString() ||
              i18n.t("connections.details.notavailable")}
          </ConnectionDetailsInfoBlock>
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
              dispatch(setCurrentOperation(operationState.deleteConnection));
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
          actionCancel={() => dispatch(setCurrentOperation(""))}
          actionDismiss={() => dispatch(setCurrentOperation(""))}
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
        <IonModal
          isOpen={modalIsOpen}
          className="edit-connections-modal"
          data-testid="edit-connections-modal"
          onDidDismiss={() => {
            if (modalIsOpen && notes !== coreNotes) {
              setNotes(coreNotes);
            }
            setModalIsOpen(false);
          }}
        >
          <div className="modal">
            <PageLayout
              header={true}
              closeButton={true}
              closeButtonLabel={`${i18n.t("connections.details.cancel")}`}
              closeButtonAction={() => {
                if (notes !== coreNotes) {
                  setNotes(coreNotes);
                }
                setModalIsOpen(false);
              }}
              actionButton={true}
              actionButtonAction={() => {
                const filteredNotes = notes.filter(
                  (note) => note.title !== "" && note.message !== ""
                );
                if (filteredNotes !== coreNotes) {
                  setNotes(filteredNotes);
                  let update = false;
                  filteredNotes.forEach((note) => {
                    if (note.id.includes(TEMP_ID_PREFIX)) {
                      AriesAgent.agent.connections.createConnectionNote(
                        connectionDetails.id,
                        note
                      );
                      update = true;
                    }
                  });
                  coreNotes.forEach((noteCore) => {
                    const noteFind = filteredNotes.find(
                      (noteFilter) => noteCore.id === noteFilter.id
                    );
                    if (!noteFind) {
                      AriesAgent.agent.connections.deleteConnectionNoteById(
                        noteCore.id
                      );
                      update = true;
                    } else if (
                      noteCore.title !== noteFind.title ||
                      noteCore.message !== noteFind.message
                    ) {
                      AriesAgent.agent.connections.updateConnectionNoteById(
                        noteCore.id,
                        noteFind
                      );
                      update = true;
                    }
                  });
                  if (update) {
                    dispatch(setCurrentOperation(toastState.notesUpdated));
                    update = false;
                  }
                }
                setModalIsOpen(false);
              }}
              actionButtonLabel={`${i18n.t("connections.details.confirm")}`}
            >
              <div className="connection-details-content">
                <ConnectionDetailsHeader />
                <div className="connection-details-info-block">
                  {notes.length ? (
                    <>
                      <h3>{i18n.t("connections.details.notes")}</h3>
                      {notes.map((note, index) => (
                        <Note
                          title={note.title}
                          message={note.message}
                          id={note.id}
                          key={index}
                        />
                      ))}
                    </>
                  ) : (
                    <i className="connection-details-info-block-nonotes">
                      {i18n.t("connections.details.nocurrentnotes")}
                    </i>
                  )}
                </div>
                <div className="connection-details-add-note">
                  <IonButton
                    shape="round"
                    className="primary-button"
                    onClick={() => {
                      setNotes([
                        ...notes,
                        {
                          title: "",
                          message: "",
                          id: TEMP_ID_PREFIX + notes.length,
                        },
                      ]);
                    }}
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={createOutline}
                    />
                  </IonButton>
                </div>
              </div>
            </PageLayout>
          </div>
        </IonModal>
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
          dispatch(setCurrentOperation(toastState.noteRemoved));
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
