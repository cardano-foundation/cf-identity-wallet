import { useState } from "react";
import { trashOutline } from "ionicons/icons";
import { IonButton, IonIcon, IonInput, IonTextarea } from "@ionic/react";
import { i18n } from "../../../../i18n";
import { ConnectionNoteProps } from "./ConnectionNote.types";

const ConnectionNote = ({
  data,
  onNoteDataChange,
  onDeleteNote,
}: ConnectionNoteProps) => {
  const { title, message, id } = data;
  const [newTitle, setNewTitle] = useState(title);
  const [newMessage, setNewMessage] = useState(message);
  const TITLE_MAX_LENGTH = 64;
  const MESSAGE_MAX_LENGTH = 576;

  const submitNoteChange = () => {
    onNoteDataChange({
      id: id,
      title: newTitle,
      message: newMessage,
    });
  };

  return (
    <div
      data-testid="connection-note"
      className="connection-details-info-block-inner"
    >
      <div className="connection-details-info-block-line">
        <div className="connection-details-info-block-data">
          <div className="connection-details-info-block-title">
            <span>{i18n.t("connections.details.title")}</span>
            <span data-testid="title-length">
              {newTitle.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <IonInput
            data-testid={`edit-connections-modal-note-title-${id}`}
            onIonInput={(e) => setNewTitle(`${e.target.value ?? ""}`)}
            onIonBlur={submitNoteChange}
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
            onIonInput={(e) => setNewMessage(`${e.target.value ?? ""}`)}
            onIonBlur={submitNoteChange}
            value={newMessage}
          />
        </div>
      </div>
      <div className="connection-details-delete-note">
        <IonButton
          shape="round"
          color={"danger"}
          data-testid={`note-delete-button-${id}`}
          onClick={() => {
            onDeleteNote(id);
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
