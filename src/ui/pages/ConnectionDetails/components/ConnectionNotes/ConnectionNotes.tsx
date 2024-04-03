import { addOutline } from "ionicons/icons";
import { ConnectionNotesProps } from "./ConnectionNotes.types";
import { i18n } from "../../../../../i18n";
import { PageFooter } from "../../../../components/PageFooter";
import { CardDetailsBlock } from "../../../../components/card-detail";
import "./ConnectionNotes.scss";
import { IonText } from "@ionic/react";

const ConnectionNotes = ({
  notes,
  onOptionButtonClick,
  pageId,
}: ConnectionNotesProps) => {
  if (notes.length === 0) {
    return (
      <p className="connection-notes-empty">
        {i18n.t("connections.details.nocurrentnotesext")}
      </p>
    );
  }

  return (
    <>
      {notes.map((note, index) => (
        <CardDetailsBlock
          key={index}
          className="connection-details-notes"
          title={index === 0 ? i18n.t("connections.details.notes") : undefined}
        >
          <h4 className="connection-details-note-title">{note.title}</h4>
          <IonText className="connection-details-note-text">
            {note.message}
          </IonText>
        </CardDetailsBlock>
      ))}
      <PageFooter
        pageId={pageId}
        primaryButtonIcon={notes.length > 0 ? "" : addOutline}
        primaryButtonText={`${
          notes.length > 0
            ? i18n.t("connections.details.options.labels.manage")
            : i18n.t("connections.details.options.labels.add")
        }`}
        primaryButtonAction={onOptionButtonClick}
      />
    </>
  );
};

export { ConnectionNotes };
