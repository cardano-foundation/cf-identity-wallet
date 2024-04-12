import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { i18n } from "../../../../i18n";
import { ConnectionNote } from "./ConnectionNote";
import ConnectionDetailsHeader from "./ConnectionDetailsHeader";
import { Agent } from "../../../../core/agent/agent";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { useAppDispatch } from "../../../../store/hooks";
import { EditConnectionsModalProps } from "./EditConnectionsModal.types";
import KeriLogo from "../../../../ui/assets/images/KeriGeneric.jpg";
import "./EditConnectionsModal.scss";
import { ConnectionNoteDetails } from "../../../../core/agent/agent.types";
import { Alert } from "../../../components/Alert";

export const EditConnectionsContainer = ({
  notes,
  setNotes,
  modalIsOpen,
  setModalIsOpen,
  connectionDetails,
  onConfirm,
}: EditConnectionsModalProps) => {
  const TEMP_ID_PREFIX = "temp";
  const dispatch = useAppDispatch();
  const [updatedNotes, setUpdatedNotes] = useState<ConnectionNoteDetails[]>([
    ...notes,
  ]);
  const [alertDeleteNoteIsOpen, setAlertDeleteNoteIsOpen] = useState(false);
  const deleteNoteId = useRef("");

  useEffect(() => {
    if (modalIsOpen) setUpdatedNotes([...notes]);
  }, [modalIsOpen]);

  const confirm = () => {
    try {
      const filteredNotes = updatedNotes.filter(
        (note) => note.title !== "" && note.message !== ""
      );

      let update = false;
      filteredNotes.forEach((note) => {
        if (note.id.includes(TEMP_ID_PREFIX)) {
          Agent.agent.connections.createConnectionNote(
            connectionDetails.id,
            note
          );
          update = true;
        }
      });

      notes.forEach((note) => {
        const noteFind = filteredNotes.find(
          (noteFilter) => note.id === noteFilter.id
        );

        if (!noteFind) {
          Agent.agent.connections.deleteConnectionNoteById(note.id);
          update = true;
          return;
        }

        if (
          note.title !== noteFind.title ||
          note.message !== noteFind.message
        ) {
          Agent.agent.connections.updateConnectionNoteById(note.id, noteFind);
          update = true;
        }
      });

      if (update) {
        setNotes(filteredNotes);
        dispatch(setToastMsg(ToastMsgType.NOTES_UPDATED));
        onConfirm();
        update = false;
      }
    } catch (e) {
      // TODO: handle error
    } finally {
      setModalIsOpen(false);
    }
  };

  const handleAddNewNote = () => {
    setUpdatedNotes((currentNotes) => [
      ...currentNotes,
      {
        title: "",
        message: "",
        id: TEMP_ID_PREFIX + Date.now(),
      },
    ]);
  };

  const handleUpdateNotes = (note: ConnectionNoteDetails) => {
    const updateNoteIndex = updatedNotes.findIndex(
      (currentNote) => currentNote.id === note.id
    );

    if (updateNoteIndex === -1) return;

    const updateNote = updatedNotes[updateNoteIndex];
    if (updateNote.message === note.message && updateNote.title === note.title)
      return;

    setUpdatedNotes((currentNotes) => {
      currentNotes[updateNoteIndex] = {
        ...note,
      };

      return [...currentNotes];
    });
  };

  const openAlert = (id: string) => {
    setAlertDeleteNoteIsOpen(true);
    deleteNoteId.current = id;
  };

  const handleDeleteNote = () => {
    if (!deleteNoteId.current) return;

    const newNotes = updatedNotes.filter(
      (note) => note.id !== deleteNoteId.current
    );
    setUpdatedNotes(newNotes);
    deleteNoteId.current = "";
    dispatch(setToastMsg(ToastMsgType.NOTE_REMOVED));
  };

  return (
    <>
      <div className="modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonLabel={`${i18n.t("connections.details.cancel")}`}
          closeButtonAction={() => {
            setModalIsOpen(false);
          }}
          actionButton={true}
          actionButtonAction={confirm}
          actionButtonLabel={`${i18n.t("connections.details.confirm")}`}
        >
          <div className="connection-details-content">
            <ConnectionDetailsHeader
              logo={connectionDetails?.logo || KeriLogo}
              label={connectionDetails?.label}
              date={connectionDetails?.connectionDate}
            />
            <div className="connection-details-info-block">
              {updatedNotes.length ? (
                <>
                  <h3>{i18n.t("connections.details.notes")}</h3>
                  {updatedNotes.map((note) => (
                    <ConnectionNote
                      data={note}
                      onNoteDataChange={handleUpdateNotes}
                      onDeleteNote={openAlert}
                      key={note.id}
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
                data-testid="add-note-button"
                onClick={handleAddNewNote}
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
      <Alert
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
        actionConfirm={() => handleDeleteNote()}
        actionCancel={() => setAlertDeleteNoteIsOpen(false)}
        actionDismiss={() => setAlertDeleteNoteIsOpen(false)}
      />
    </>
  );
};

const EditConnectionsModal = ({
  notes,
  setNotes,
  modalIsOpen,
  setModalIsOpen,
  connectionDetails,
  onConfirm,
}: EditConnectionsModalProps) => {
  return (
    <IonModal
      isOpen={modalIsOpen}
      className="edit-connections-modal"
      data-testid="edit-connections-modal"
      onDidDismiss={() => {
        setModalIsOpen(false);
      }}
    >
      <EditConnectionsContainer
        notes={notes}
        setNotes={setNotes}
        connectionDetails={connectionDetails}
        onConfirm={onConfirm}
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
    </IonModal>
  );
};

export { EditConnectionsModal };
