import { keyOutline, informationCircleOutline } from "ionicons/icons";
import { JsonObject } from "@aries-framework/core";
import { i18n } from "../../../../i18n";
import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";
import {
  CardDetailsBlock,
  CardDetailsItem,
  CardDetailsAttributes,
} from "../../../components/card-detail";

interface ACDCContentProps {
  cardData: ACDCDetails;
}

const CredContentAcdc = ({ cardData }: ACDCContentProps) => {
  return (
    <>
      <CardDetailsBlock title={i18n.t("creds.card.details.title")}>
        <CardDetailsItem
          info={cardData.credentialType}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="cred-content-acdc-card"
        title={i18n.t("creds.card.details.description.label")}
      >
        {cardData.s.description}
      </CardDetailsBlock>
      {cardData.a && (
        <CardDetailsBlock
          className="card-attribute-block"
          title={i18n.t("creds.card.details.attributes.label")}
        >
          <CardDetailsAttributes data={cardData.a as JsonObject} />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title={i18n.t("creds.card.details.schemaversion")}>
        <CardDetailsItem
          info={cardData.s.version}
          icon={informationCircleOutline}
          testId="card-details-schema-version"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title={i18n.t("creds.card.details.issuer")}>
        <CardDetailsItem
          info={cardData.i}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-issuer"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="card-attribute-block"
        title={i18n.t("creds.card.details.status.label")}
      >
        <CardDetailsAttributes
          data={cardData.lastStatus as JsonObject}
          customType="status"
        />
      </CardDetailsBlock>
    </>
  );
};

export { CredContentAcdc };
