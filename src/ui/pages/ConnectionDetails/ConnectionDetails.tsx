import { IonButton, IonIcon, IonInput, IonModal, IonPage } from "@ionic/react";
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
import { operationState } from "../../constants/dictionary";
import { AriesAgent } from "../../../core/agent/agent";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";

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
  const [notes, setNotes] = useState<NotesProps[]>([]);
  const currentNoteIndex = useRef(0);

  useEffect(() => {
    async function getDetails() {
      const connectionDetails =
        await AriesAgent.agent.connections.getConnectionById(
          connectionShortDetails.id
        );
      setConnectionDetails(connectionDetails);
    }
    if (connectionShortDetails?.id) getDetails();
  }, [connectionShortDetails?.id]);

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
  // handle loading
  if (!connectionDetails) return <div></div>;
  const verifyAction = () => {
    // @TODO - sdisalvo: Update core
    const updatedConnections = connectionsData.filter(
      (item) => item.id !== connectionDetails.id
    );
    dispatch(setConnectionsCache(updatedConnections));
    handleDone();
    setVerifyPasswordIsOpen(false);
    setVerifyPasscodeIsOpen(false);
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

  interface NotesProps {
    title: string;
    message: string;
    index: number;
  }

  const Note = ({ title, message, index }: NotesProps) => {
    const [newTitle, setNewTitle] = useState(title);
    const [newMessage, setNewMessage] = useState(message);

    return (
      <div className="connection-details-info-block-inner">
        <div className="connection-details-info-block-line">
          <div className="connection-details-info-block-data">
            <div className="connection-details-info-block-title">
              <span>{i18n.t("connections.details.title")}</span>
              <span>{title.length}/64</span>
            </div>
            <IonInput
              data-testid={`edit-connections-modal-note-title-${index + 1}`}
              onIonChange={(e) => setNewTitle(`${e.target.value ?? ""}`)}
              onIonBlur={() => {
                const newNotes = [...notes];
                newNotes[index].title = newTitle;
              }}
              value={newTitle}
            />
          </div>
          <div className="connection-details-info-block-data">
            <div className="connection-details-info-block-title">
              <span>{i18n.t("connections.details.message")}</span>
              <span>{message.length}/576</span>
            </div>
            <IonInput
              data-testid={`edit-connections-modal-note-message-${index + 1}`}
              onIonChange={(e) => setNewMessage(`${e.target.value ?? ""}`)}
              onIonBlur={() => {
                const newNotes = [...notes];
                newNotes[index].message = newMessage;
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
              currentNoteIndex.current = index;
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

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.label")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {connectionDetails?.label}
                </div>
              </div>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.date")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {formatShortDate(`${connectionDetails?.connectionDate}`)}
                </div>
              </div>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.goalcodes")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {connectionDetails?.goalCode ||
                    i18n.t("connections.details.notavailable")}
                </div>
              </div>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.handshake")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {connectionDetails?.handshakeProtocols?.toString() ||
                    i18n.t("connections.details.notavailable")}
                </div>
              </div>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.attachments")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {connectionDetails?.requestAttachments?.toString() ||
                    i18n.t("connections.details.notavailable")}
                </div>
              </div>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.endpoints")}</h3>
            <div className="connection-details-info-block-inner">
              <div className="connection-details-info-block-line">
                <div className="connection-details-info-block-data">
                  {connectionDetails?.serviceEndpoints?.toString() ||
                    i18n.t("connections.details.notavailable")}
                </div>
              </div>
            </div>
          </div>

          {notes.length > 0 ? (
            <div className="connection-details-info-block">
              <h3>{i18n.t("connections.details.notes")}</h3>
              {notes.map((note, index) => (
                <div
                  className="connection-details-info-block-inner"
                  key={index}
                >
                  <div className="connection-details-info-block-line">
                    <div className="connection-details-info-block-data">
                      {note.title}
                    </div>
                    <div className="connection-details-info-block-note">
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
          dataTestId="alert-confirm"
          headerText={i18n.t("connections.details.options.alert.title")}
          confirmButtonText={`${i18n.t(
            "connections.details.options.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "connections.details.options.alert.cancel"
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
      <IonModal
        isOpen={modalIsOpen}
        className={""}
        data-testid="edit-connections-modal"
        onDidDismiss={() => setModalIsOpen(false)}
      >
        <div className="edit-connections-modal modal">
          <PageLayout
            header={true}
            closeButton={true}
            closeButtonLabel={`${i18n.t("connections.details.cancel")}`}
            closeButtonAction={() => setModalIsOpen(false)}
            actionButton={true}
            actionButtonAction={() => setModalIsOpen(false)}
            actionButtonLabel={`${i18n.t("connections.details.confirm")}`}
          >
            <ConnectionDetailsHeader />
            <div className="connection-details-info-block">
              {notes.length ? (
                <>
                  <h3>{i18n.t("connections.details.notes")}</h3>
                  {notes.map((note, index) => (
                    <Note
                      title={note.title}
                      message={note.message}
                      index={index}
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
                className="ion-primary-button"
                onClick={() => {
                  setNotes([
                    ...notes,
                    {
                      title: "",
                      message: "",
                      index: notes.length,
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
          </PageLayout>
        </div>
      </IonModal>
      <AlertDeleteNote
        isOpen={alertDeleteNoteIsOpen}
        setIsOpen={setAlertDeleteNoteIsOpen}
        dataTestId="alert-confirm"
        headerText={i18n.t("connections.details.options.alert.title")}
        confirmButtonText={`${i18n.t(
          "connections.details.options.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "connections.details.options.alert.cancel"
        )}`}
        actionConfirm={() => {
          const newNotes = [...notes];
          newNotes.splice(currentNoteIndex.current, 1);
          setNotes(newNotes);
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
