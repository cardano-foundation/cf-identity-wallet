import { IonText } from "@ionic/react";
import { i18n } from "../../../../../i18n";
import { CardDetailsBlock } from "../../../../components/CardDetails";
import { OptionModal } from "../../../../components/OptionsModal";
import { MembersModalProps } from "./CredentialRequest.types";
import { MultisigMember } from "../../../../components/CredentialDetailModule/components/MultisigMember";

const MembersModal = ({
  isOpen,
  onClose,
  credName,
  members,
  threshold,
  joinedMembers,
}: MembersModalProps) => {
  return (
    <OptionModal
      modalIsOpen={isOpen}
      customClasses="members-modal"
      onDismiss={onClose}
      componentId="members-modal"
      header={{
        closeButton: true,
        closeButtonLabel: `${i18n.t(
          "tabs.notifications.details.buttons.done"
        )}`,
        closeButtonAction: onClose,
        title: credName,
      }}
    >
      <CardDetailsBlock
        className="threshold-card"
        title={`${i18n.t(
          "tabs.notifications.details.credential.request.information.threshold"
        )}`}
      >
        <div className="threshold">
          <IonText className="requested-credential">{threshold}</IonText>
          <IonText className="requested-credential">
            {joinedMembers}/{threshold}
          </IonText>
        </div>
      </CardDetailsBlock>
      <CardDetailsBlock
        className="group-members"
        title={i18n.t(
          "tabs.notifications.details.credential.request.information.joinedmembers"
        )}
      >
        {members.map((member) => (
          <MultisigMember
            key={member.aid}
            name={member.name}
          />
        ))}
      </CardDetailsBlock>
    </OptionModal>
  );
};

export { MembersModal };
