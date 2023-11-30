import { formatShortDate } from "../../../utils/formatters";
import CardanoLogo from "../../../../ui/assets/images/CardanoLogo.jpg";
import { ConnectionDetailsHeaderProps } from "./ConnectionDetailsHeader.types";

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
      <span className="connection-details-issuer">{label}</span>
      <span className="connection-details-date">
        {formatShortDate(`${date}`)}
      </span>
    </div>
  );
};

export default ConnectionDetailsHeader;
