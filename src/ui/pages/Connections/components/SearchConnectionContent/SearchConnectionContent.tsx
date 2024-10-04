import { IonIcon } from "@ionic/react";
import { search } from "ionicons/icons";
import { useMemo } from "react";
import { i18n } from "../../../../../i18n";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { CardItem, CardList } from "../../../../components/CardList";
import { ListHeader } from "../../../../components/ListHeader";
import { ConnectionShortDetails } from "../../Connections.types";
import {
  SearchConnectionContentProps,
  SearchConnectionListProps,
} from "../ConnectionsBody/ConnectionsBody.types";
import "./SearchConnectionContent.scss";

const SearchConnectionList = ({
  connections,
  onItemClick,
  testId,
  title,
}: SearchConnectionListProps) => {
  const cardListData = useMemo(() => {
    return connections.map((connection): CardItem<ConnectionShortDetails> => {
      return {
        id: connection.id,
        title: connection.label,
        image: connection.logo || KeriLogo,
        data: connection,
      };
    });
  }, [connections]);

  return (
    <div>
      <ListHeader title={title} />
      <CardList
        className="connections-card-list"
        data={cardListData}
        lines="none"
        onCardClick={onItemClick}
        testId={`${testId}-list`}
      />
    </div>
  );
};

const SearchConnectionContent = ({
  mappedConnections,
  onItemClick,
  keyword,
}: SearchConnectionContentProps) => {
  const connections = useMemo(() => {
    return mappedConnections.flatMap((item) => {
      return item.value.filter((item) =>
        item.label.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  }, [mappedConnections, keyword]);

  if (connections.length === 0) {
    return (
      <div
        data-testid="empty-search-connection"
        className="search-connection-content no-result"
      >
        <IonIcon icon={search} />
        <h3>
          {i18n.t("connections.tab.search.noresult.title", {
            keyword,
          })}
        </h3>
        <p>{i18n.t("connections.tab.search.noresult.text")}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="search-connection"
      className="search-connection-content"
    >
      <SearchConnectionList
        title={`${i18n.t("connections.tab.search.connections")}`}
        connections={connections}
        onItemClick={onItemClick}
        testId="connection-search"
      />
    </div>
  );
};

export { SearchConnectionContent };
