import i18next from "i18next";
import {
  ConnectionDetails,
  ConnectionHistoryItem,
} from "../../../../core/agent/agent.types";
import { ConnectionHistoryType } from "../../../../core/agent/services/connectionService.types";
import { i18n } from "../../../../i18n";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { CREDENTIAL_BG } from "../../../globals/types";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";

const ConnectionHistoryEvent = ({
  index,
  historyItem,
  connectionDetails,
}: {
  index?: number;
  historyItem?: ConnectionHistoryItem;
  connectionDetails?: ConnectionDetails;
}) => {

  const isRareEvo = historyItem?.credentialType === "Rare EVO 2024 Attendee";

  const image = isRareEvo ? CREDENTIAL_BG.RARE : CREDENTIAL_BG.KERI;

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
              src={image}
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
          {historyItem.type === ConnectionHistoryType.CREDENTIAL_ADMITTED &&
            i18next.t("connections.details.admitted", {
              credential: historyItem.credentialType
                ?.replace(/([A-Z][a-z])/g, " $1")
                .replace(/^ /, "")
                .replace(/(\d)/g, "$1")
                .replace(/ {2,}/g, " "),
            })}
          {historyItem.type ===
            ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT &&
            i18next.t("connections.details.requestpresent", {
              issuer: connectionDetails?.label,
            })}
          {historyItem.type === ConnectionHistoryType.CREDENTIAL_PRESENTED &&
            i18n.t("connections.details.presented", {
              credentialType: historyItem.credentialType,
            })}
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
            `${connectionDetails?.createdAtUTC}`
          )} - ${formatTimeToSec(`${connectionDetails?.createdAtUTC}`)}`}
        </span>
      </p>
    </div>
  );
};

export { ConnectionHistoryEvent };
