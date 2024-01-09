import { ConnectionShortDetails } from "../Connections.types";
import { ConnectionItem } from "./ConnectionItem";

const AlphabeticList = ({
  items,
  handleShowConnectionDetails,
}: {
  items: ConnectionShortDetails[];
  handleShowConnectionDetails: (item: ConnectionShortDetails) => void;
}) => {
  return (
    <>
      {items.map((connection, index) => {
        return (
          <ConnectionItem
            key={index}
            item={connection}
            handleShowConnectionDetails={handleShowConnectionDetails}
          />
        );
      })}
    </>
  );
};

export { AlphabeticList };
