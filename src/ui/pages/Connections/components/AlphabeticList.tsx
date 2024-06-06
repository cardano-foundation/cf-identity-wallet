import { useMemo } from "react";
import { hourglassOutline } from "ionicons/icons";
import { IonChip, IonIcon } from "@ionic/react";
import { CardItem, CardList } from "../../../components/CardList";
import { ConnectionShortDetails } from "../Connections.types";
import { formatShortDate } from "../../../utils/formatters";
import KeriLogo from "../../../../ui/assets/images/KeriGeneric.jpg";
import { ConnectionStatus } from "../../../../core/agent/agent.types";

const AlphabeticList = ({
  items,
  handleShowConnectionDetails,
}: {
  items: ConnectionShortDetails[];
  handleShowConnectionDetails: (item: ConnectionShortDetails) => void;
}) => {
  const displayConnection = useMemo((): CardItem<ConnectionShortDetails>[] => {
    return items.map((connection) => ({
      id: connection.id,
      title: connection.label as string,
      subtitle: formatShortDate(`${connection?.connectionDate}`),
      image: connection.logo || KeriLogo,
      data: connection,
    }));
  }, [items]);

  return (
    <CardList
      onCardClick={handleShowConnectionDetails}
      data={displayConnection}
      onRenderEndSlot={(data) =>
        data.status === ConnectionStatus.PENDING ? (
          <IonChip>
            <IonIcon
              icon={hourglassOutline}
              color="primary"
            ></IonIcon>
            <span>{data.status}</span>
          </IonChip>
        ) : null
      }
    />
  );
};

export { AlphabeticList };
