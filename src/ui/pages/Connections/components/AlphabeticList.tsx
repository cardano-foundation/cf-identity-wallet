import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { useMemo } from "react";
import {
  ConnectionShortDetails,
  ConnectionStatus,
} from "../../../../core/agent/agent.types";
import { CardList } from "../../../components/CardList";
import { CardItem } from "../../../components/CardList/CardList.types";
import { getFallbackIcon } from "../../../components/FallbackIcon";
import { formatShortDate } from "../../../utils/formatters";

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
      subtitle: formatShortDate(`${connection?.createdAtUTC}`),
      image: connection.logo || getFallbackIcon(),
      data: connection,
    }));
  }, [items]);

  return (
    <CardList
      onCardClick={handleShowConnectionDetails}
      data={displayConnection}
      onRenderEndSlot={(data) =>
        data.status === ConnectionStatus.PENDING ||
        data.status === ConnectionStatus.FAILED ? (
            <IonChip>
              <IonIcon
                icon={hourglassOutline}
                color="primary"
              ></IonIcon>
              <span>{ConnectionStatus.PENDING}</span>
            </IonChip>
          ) : null
      }
    />
  );
};

export { AlphabeticList };
