import { IonIcon, IonItem, IonText } from "@ionic/react";
import { checkmark, closeOutline, hourglassOutline } from "ionicons/icons";
import { useMemo } from "react";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { combineClassNames } from "../../../utils/style";
import "./MultisigMember.scss";
import { MemberAcceptStatus, MemberProps } from "./MultisigMember.types";

const MultisigMember = ({ name, status }: MemberProps) => {
  const statusClasses = combineClassNames("status", {
    accepted: status === MemberAcceptStatus.Accepted,
    waiting: status === MemberAcceptStatus.Waiting,
    rejected: status === MemberAcceptStatus.Rejected,
  });

  const icon = useMemo(() => {
    switch (status) {
    case MemberAcceptStatus.Accepted:
      return checkmark;
    case MemberAcceptStatus.Rejected:
      return closeOutline;
    case MemberAcceptStatus.Waiting:
      return hourglassOutline;
    default:
      return null;
    }
  }, [status]);

  return (
    <IonItem
      lines="none"
      className="multisig-member"
    >
      <img
        className="member-avatar"
        slot="start"
        src={KeriLogo}
        alt="keri"
      />
      <IonText
        slot="start"
        className="member-name"
      >
        {name}
      </IonText>
      {status !== undefined && icon && (
        <IonIcon
          slot="end"
          icon={icon}
          className={statusClasses}
        />
      )}
    </IonItem>
  );
};

export { MultisigMember };
