import { IonIcon, IonItem, IonText } from "@ionic/react";
import { checkmark, closeOutline, hourglassOutline } from "ionicons/icons";
import { useMemo } from "react";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { combineClassNames } from "../../../../utils/style";
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
    default:
      return hourglassOutline;
    }
  }, [status]);

  return (
    <IonItem
      lines="none"
      className="member"
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
      <IonIcon
        slot="end"
        icon={icon}
        className={statusClasses}
      />
    </IonItem>
  );
};

export { MultisigMember };
