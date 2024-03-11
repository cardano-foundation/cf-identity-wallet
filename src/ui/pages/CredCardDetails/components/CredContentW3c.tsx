import {
  keyOutline,
  calendarNumberOutline,
  informationCircleOutline,
  pricetagOutline,
} from "ionicons/icons";
import { JsonObject } from "@aries-framework/core";
import { i18n } from "../../../../i18n";
import {
  CardDetailsInfoBlock,
  CardDetailsItem,
  CardDetailsAttributes,
} from "../../../components/CardDetailsElements";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { W3CCredentialDetails } from "../../../../core/agent/services/credentialService.types";
import { ConnectionDetails } from "../../Connections/Connections.types";

interface CredContentW3cProps {
  cardData: W3CCredentialDetails;
  connectionDetails: ConnectionDetails | undefined;
}

const CredContentW3c = ({
  cardData,
  connectionDetails,
}: CredContentW3cProps) => {
  return (
    <div className="card-details-content">
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.type")}>
        <CardDetailsItem
          info={cardData.credentialType
            .replace(/([A-Z][a-z])/g, " $1")
            .replace(/(\d)/g, " $1")}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsInfoBlock>
      {cardData.credentialSubject && (
        <CardDetailsInfoBlock
          title={i18n.t("creds.card.details.attributes.label")}
        >
          <CardDetailsAttributes
            data={cardData.credentialSubject as JsonObject}
          />
        </CardDetailsInfoBlock>
      )}
      {connectionDetails?.label && (
        <CardDetailsInfoBlock title={i18n.t("creds.card.details.connection")}>
          <CardDetailsItem
            info={connectionDetails.label}
            icon={pricetagOutline}
            testId="card-details-connection-label"
          />
          <CardDetailsItem
            info={connectionDetails.id}
            copyButton={true}
            icon={keyOutline}
            testId="card-details-connection-id"
          />
        </CardDetailsInfoBlock>
      )}
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.issuancedate")}>
        <CardDetailsItem
          info={
            cardData.issuanceDate
              ? formatShortDate(cardData.issuanceDate) +
                " - " +
                formatTimeToSec(cardData.issuanceDate)
              : i18n.t("creds.card.details.notavailable")
          }
          icon={calendarNumberOutline}
          testId="card-details-issuance-date"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.expirationdate")}>
        <CardDetailsItem
          info={
            cardData.expirationDate
              ? formatShortDate(cardData.expirationDate) +
                " - " +
                formatTimeToSec(cardData.expirationDate)
              : i18n.t("creds.card.details.notavailable")
          }
          icon={calendarNumberOutline}
          testId="card-details-expiration-date"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.prooftypes")}>
        <CardDetailsItem
          info={cardData.proofType}
          icon={informationCircleOutline}
          testId="card-details-proof-type"
        />
        {cardData.proofValue && (
          <CardDetailsItem
            info={cardData.proofValue}
            copyButton={true}
            icon={keyOutline}
            testId="card-details-proof-value"
          />
        )}
      </CardDetailsInfoBlock>
    </div>
  );
};

export { CredContentW3c };
