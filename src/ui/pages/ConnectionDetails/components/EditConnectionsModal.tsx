import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { PageLayout } from "../../../components/layout/PageLayout";
import { i18n } from "../../../../i18n";
import { ConnectionNote } from "./ConnectionNote";
import ConnectionDetailsHeader from "./ConnectionDetailsHeader";
import { AriesAgent } from "../../../../core/agent/agent";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { ConnectionNoteProps } from "./ConnectionNote.types";
import { useAppDispatch } from "../../../../store/hooks";
import { EditConnectionsModalProps } from "./EditConnectionsModal.types";
import KeriLogo from "../../../../ui/assets/images/KeriGeneric.jpg";
import DidComLogo from "../../../../ui/assets/images/didCommGeneric.jpg";
import "./EditConnectionsModal.scss";
import { ConnectionType } from "../../../../core/agent/agent.types";

const EditConnectionsModal = ({
  notes,
  setNotes,
  coreNotes,
  modalIsOpen,
  setModalIsOpen,
  currentNoteId,
  connectionDetails,
  setAlertDeleteNoteIsOpen,
}: EditConnectionsModalProps) => {
  const fallbackLogo =
    connectionDetails.type === ConnectionType.DIDCOMM ? DidComLogo : KeriLogo;
  const TEMP_ID_PREFIX = "temp";
  const dispatch = useAppDispatch();

  return (
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
                dispatch(setToastMsg(ToastMsgType.NOTES_UPDATED));
                update = false;
              }
            }
            setModalIsOpen(false);
          }}
          actionButtonLabel={`${i18n.t("connections.details.confirm")}`}
        >
          <div className="connection-details-content">
            <ConnectionDetailsHeader
              logo={connectionDetails?.logo || fallbackLogo}
              label={connectionDetails?.label}
              date={connectionDetails?.connectionDate}
            />
            <div className="connection-details-info-block">
              {notes.length ? (
                <>
                  <h3>{i18n.t("connections.details.notes")}</h3>
                  {notes.map((note, index) => (
                    <ConnectionNote
                      title={note.title}
                      message={note.message}
                      id={note.id}
                      notes={notes as ConnectionNoteProps[]}
                      currentNoteId={currentNoteId}
                      setAlertDeleteNoteIsOpen={setAlertDeleteNoteIsOpen}
                      key={index}
                      setNotes={setNotes}
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
  );
};

export { EditConnectionsModal };
