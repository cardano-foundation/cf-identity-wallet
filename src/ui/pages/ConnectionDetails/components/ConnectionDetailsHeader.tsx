import { formatShortDate } from "../../../utils/formatters";
import CardanoLogo from "../../../../ui/assets/images/CardanoLogo.jpg";
import { ConnectionDetailsHeaderProps } from "./ConnectionDetailsHeader.types";
import "./ConnectionDetailsHeader.scss";

const ConnectionDetailsHeader = ({
  logo,
  label,
  date,
}: ConnectionDetailsHeaderProps) => {
  return (
    <div className="connection-details-header">
      <div className="connection-details-logo">
        <img
          src={logo ?? CardanoLogo}
          alt="connection-logo"
        />
      </div>
      <h2>{label}</h2>
      <p>{formatShortDate(`${date}`)}</p>
    </div>
  );
};

export default ConnectionDetailsHeader;
