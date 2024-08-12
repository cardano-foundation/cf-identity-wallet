import i18next from "i18next";
import Minicred from "../../../assets/images/minicred.jpg";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import {
  ConnectionDetails,
  ConnectionHistoryItem,
} from "../../../../core/agent/agent.types";
import { ConnectionHistoryType } from "../../../../core/agent/services/connection.types";
import { i18n } from "../../../../i18n";

const ConnectionHistoryEvent = ({
  index,
  historyItem,
  connectionDetails,
}: {
  index?: number;
  historyItem?: ConnectionHistoryItem;
  connectionDetails?: ConnectionDetails;
}) => {
  return historyItem ? (
    <div
      className="connection-details-history-event"
      data-testid={`connection-history-event-${index}`}
      key={index}
    >
      <div className="connection-details-logo">
        {historyItem.type ===
        ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT ? (
            <img
              src={connectionDetails?.logo || KeriLogo}
              alt="connection-logo"
            />
          ) : (
            <img
              src={Minicred}
              alt="credential-miniature"
              className="credential-miniature"
            />
          )}
      </div>
      <p className="connection-details-history-event-info">
        <span className="connection-details-history-text">
          {historyItem.type === ConnectionHistoryType.CREDENTIAL_ISSUANCE &&
            i18next.t("connections.details.issuance", {
              credential: historyItem.credentialType
                ?.replace(/([A-Z][a-z])/g, " $1")
                .replace(/^ /, "")
                .replace(/(\d)/g, "$1")
                .replace(/ {2,}/g, " "),
            })}
          {historyItem.type ===
            ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT &&
            i18next.t("connections.details.present", {
              issuer: connectionDetails?.label,
            })}
          {historyItem.type ===
            ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE &&
            i18n.t("connections.details.agree")}
          {historyItem.type === ConnectionHistoryType.CREDENTIAL_REVOKED &&
            i18next.t("connections.details.update", {
              credential: historyItem.credentialType
                ?.replace(/([A-Z][a-z])/g, " $1")
                .replace(/^ /, "")
                .replace(/(\d)/g, "$1")
                .replace(/ {2,}/g, " "),
            })}
        </span>
        <span
          data-testid="connection-history-timestamp"
          className="connection-details-history-timestamp"
        >
          {` ${formatShortDate(historyItem.timestamp)} - ${formatTimeToSec(
            historyItem.timestamp
          )}`}
        </span>
      </p>
    </div>
  ) : (
    <div
      className="connection-details-history-event"
      data-testid="connection-history-event-connection"
    >
      <div className="connection-details-logo">
        <img
          src={connectionDetails?.logo || KeriLogo}
          alt="connection-logo"
        />
      </div>
      <p className="connection-details-history-event-info">
        <span className="connection-details-history-text">
          {i18next.t("connections.details.connectedwith", {
            issuer: connectionDetails?.label,
          })}
        </span>
        <span
          data-testid="connection-detail-date"
          className="connection-details-history-timestamp"
        >
          {` ${formatShortDate(
            `${connectionDetails?.connectionDate}`
          )} - ${formatTimeToSec(`${connectionDetails?.connectionDate}`)}`}
        </span>
      </p>
    </div>
  );
};

export { ConnectionHistoryEvent };
