import { formatShortDate } from "../../../utils/formatters";
import { NotificationDetailsHeaderProps } from "./NotificationDetailsHeader.types";
import "./NotificationDetailsHeader.scss";

const NotificationDetailsHeader = ({
  logo,
  label,
  date,
}: NotificationDetailsHeaderProps) => {
  return (
    <div className="notification-details-header">
      <div className="notification-details-logo">
        <img
          src={logo}
          alt="notification-logo"
        />
      </div>
      <h2 data-testid="notification-name">{label}</h2>
      <p data-testid="data-notification-time">{formatShortDate(`${date}`)}</p>
    </div>
  );
};

export { NotificationDetailsHeader };
