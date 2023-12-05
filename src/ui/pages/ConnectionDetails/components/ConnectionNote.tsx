import { useState } from "react";
import { trashOutline } from "ionicons/icons";
import { IonButton, IonIcon, IonInput, IonTextarea } from "@ionic/react";
import { i18n } from "../../../../i18n";
import { ConnectionNoteProps } from "./ConnectionNote.types";

const ConnectionNote = ({
  title,
  message,
  id,
  notes,
  currentNoteId,
  setAlertDeleteNoteIsOpen,
  setNotes,
}: ConnectionNoteProps) => {
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
            onIonBlur={(e) => {
              const newNotes = [...notes];
              const noteIndex = newNotes.map((el) => el.id).indexOf(id);
              newNotes[noteIndex].title = e.target.value?.toString() ?? "";
              setNotes(newNotes);
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
            onIonBlur={(e) => {
              const newNotes = [...notes];
              const noteIndex = newNotes.map((el) => el.id).indexOf(id);
              newNotes[noteIndex].message = e.target.value?.toString() ?? "";
              setNotes(newNotes);
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
            currentNoteId = id;
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

export { ConnectionNote };
