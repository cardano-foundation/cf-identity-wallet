import {
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonChip,
  IonIcon,
} from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import {
  ConnectionStatus,
  ConnectionType,
} from "../../../../core/agent/agent.types";
import { formatShortDate } from "../../../utils/formatters";
import { ConnectionItemProps } from "../Connections.types";
import KeriLogo from "../../../../ui/assets/images/KeriGeneric.jpg";
import DidComLogo from "../../../../ui/assets/images/didCommGeneric.jpg";

const ConnectionItem = ({
  item,
  handleShowConnectionDetails,
}: ConnectionItemProps) => {
  const fallbackLogo =
    item.type === ConnectionType.DIDCOMM ? DidComLogo : KeriLogo;

  return (
    <IonItem onClick={() => handleShowConnectionDetails(item)}>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="connection-logo"
          >
            <img
              src={item?.logo || fallbackLogo}
              alt="connection-logo"
            />
          </IonCol>
          <IonCol
            size="6.25"
            className="connection-info"
          >
            <IonLabel className="connection-name">{item?.label}</IonLabel>
            <IonLabel className="connection-date">
              {formatShortDate(`${item?.connectionDate}`)}
            </IonLabel>
          </IonCol>
          <IonCol
            size="3.5"
            className="item-status"
          >
            {item.status === ConnectionStatus.PENDING && (
              <IonChip>
                <IonIcon
                  icon={hourglassOutline}
                  color="primary"
                ></IonIcon>
                <span>{item.status}</span>
              </IonChip>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

export { ConnectionItem };
