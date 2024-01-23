import {
  keyOutline,
  calendarNumberOutline,
  informationCircleOutline,
  pricetagOutline,
} from "ionicons/icons";
import { JsonObject } from "@aries-framework/core";
import { i18n } from "../../../../i18n";
import {
  CardDetailsBlock,
  CardDetailsItem,
  CardDetailsAttributes,
} from "../../../components/CardDetailsElements";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";
import { ConnectionDetails } from "../../Connections/Connections.types";

interface CredContentAcdcProps {
  // @TODO - sdisalvo: fix this once support for ACDCDetails is working.
  // cardData: ACDCDetails;
  cardData: any;
  credentialSubject: JsonObject;
  connectionDetails: ConnectionDetails | undefined;
}

const CredContentAcdc = ({
  cardData,
  credentialSubject,
  connectionDetails,
}: CredContentAcdcProps) => {
  return (
    <div className="card-details-content">
      <CardDetailsBlock title="creds.card.details.title">
        <CardDetailsItem
          info={cardData.credentialType
            .replace(/([A-Z][a-z])/g, " $1")
            .replace(/(\d)/g, " $1")}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsBlock>
      {credentialSubject && (
        <CardDetailsBlock title="creds.card.details.attributes">
          <CardDetailsAttributes data={credentialSubject} />
        </CardDetailsBlock>
      )}
      {connectionDetails?.label && (
        <CardDetailsBlock title="creds.card.details.connection">
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
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title="creds.card.details.issuancedate">
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
      </CardDetailsBlock>
      <CardDetailsBlock title="creds.card.details.expirationdate">
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
      </CardDetailsBlock>
      <CardDetailsBlock title="creds.card.details.prooftypes">
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
      </CardDetailsBlock>
    </div>
  );
};

export { CredContentAcdc };
