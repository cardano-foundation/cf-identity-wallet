import { keyOutline, informationCircleOutline } from "ionicons/icons";
import { JsonObject } from "@aries-framework/core";
import { i18n } from "../../../../i18n";
import {
  CardDetailsInfoBlock,
  CardDetailsItem,
  CardDetailsAttributes,
} from "../../../components/CardDetailsElements";
import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";

interface ACDCContentProps {
  cardData: ACDCDetails;
}

const CredContentAcdc = ({ cardData }: ACDCContentProps) => {
  return (
    <div className="card-details-content">
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.title")}>
        <CardDetailsItem
          info={cardData.credentialType}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock
        title={i18n.t("creds.card.details.description.label")}
      >
        {i18n.t("creds.card.details.description.content")}
      </CardDetailsInfoBlock>
      {cardData.a && (
        <CardDetailsInfoBlock
          title={i18n.t("creds.card.details.attributes.label")}
        >
          <CardDetailsAttributes data={cardData.a as JsonObject} />
        </CardDetailsInfoBlock>
      )}
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.schemaversion")}>
        <CardDetailsItem
          info={cardData.s.version}
          icon={informationCircleOutline}
          testId="card-details-schema-version"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.issuer")}>
        <CardDetailsItem
          info={cardData.i}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-issuer"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("creds.card.details.status.label")}>
        <CardDetailsAttributes
          data={cardData.lastStatus as JsonObject}
          customType="status"
        />
      </CardDetailsInfoBlock>
    </div>
  );
};

export { CredContentAcdc };
