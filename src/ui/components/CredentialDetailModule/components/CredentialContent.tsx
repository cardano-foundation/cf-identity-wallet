import { informationCircleOutline, keyOutline } from "ionicons/icons";
import { JSONObject } from "../../../../core/agent/services/credentialService.types";
import { i18n } from "../../../../i18n";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
  CardDetailsItem,
} from "../../CardDetails";
import { CredentialContentProps } from "./CredentialContent.types";
import { MultisigMember } from "./MultisigMember";
import { MemberAcceptStatus } from "./MultisigMember.types";

const CredentialContent = ({
  cardData,
  joinedCredRequestMembers,
}: CredentialContentProps) => {
  return (
    <>
      {joinedCredRequestMembers && (
        <CardDetailsBlock
          title={i18n.t("tabs.credentials.details.joinedmember")}
        >
          {joinedCredRequestMembers?.map((member) => (
            <MultisigMember
              key={member.aid}
              name={member.name}
              status={MemberAcceptStatus.Accepted}
            />
          ))}
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title={i18n.t("tabs.credentials.details.title")}>
        <CardDetailsItem
          info={cardData.s.title}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="cred-content-acdc-card"
        title={i18n.t("tabs.credentials.details.description")}
      >
        {cardData.s.description}
      </CardDetailsBlock>
      <CardDetailsBlock title={i18n.t("tabs.credentials.details.id")}>
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-id"
        />
      </CardDetailsBlock>
      {cardData.a && (
        <CardDetailsBlock
          className="card-attribute-block"
          title={i18n.t("tabs.credentials.details.attributes.label")}
        >
          <CardDetailsAttributes data={cardData.a as JSONObject} />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock
        title={i18n.t("tabs.credentials.details.schemaversion")}
      >
        <CardDetailsItem
          info={cardData.s.version}
          icon={informationCircleOutline}
          testId="card-details-schema-version"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title={i18n.t("tabs.credentials.details.issuer")}>
        <CardDetailsItem
          info={cardData.i}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-issuer"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="card-attribute-block"
        title={i18n.t("tabs.credentials.details.status.label")}
      >
        <CardDetailsAttributes
          data={cardData.lastStatus as JSONObject}
          customType="status"
        />
      </CardDetailsBlock>
    </>
  );
};

export { CredentialContent };
