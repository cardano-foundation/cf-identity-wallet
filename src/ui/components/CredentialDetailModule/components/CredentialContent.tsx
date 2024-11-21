import { informationCircleOutline, keyOutline } from "ionicons/icons";
import { useState } from "react";
import { JSONObject } from "../../../../core/agent/services/credentialService.types";
import { i18n } from "../../../../i18n";
import {
  CardBlock,
  CardDetailsAttributes,
  CardDetailsBlock,
  CardDetailsItem,
  FlatBorderType,
} from "../../CardDetails";
import { CredentialContentProps } from "./CredentialContent.types";
import { MultisigMember } from "./MultisigMember";
import { MemberAcceptStatus } from "./MultisigMember.types";
import { ListHeader } from "../../ListHeader";
import { ReadMore } from "../../ReadMore";
import { CredentialAttributeDetailModal } from "./CredentialAttributeDetailModal";

const CredentialContent = ({
  cardData,
  joinedCredRequestMembers,
}: CredentialContentProps) => {
  const [openDetailModal, setOpenDetailModal] = useState(false);

  return (
    <>
      <ListHeader title={i18n.t("tabs.credentials.details.about")} />
      <CardBlock
        flatBorder={FlatBorderType.BOT}
        title={i18n.t("tabs.credentials.details.type")}
      >
        <CardDetailsItem
          info={cardData.s.title}
          testId={"credential-details-type-block"}
          icon={informationCircleOutline}
          mask={false}
          fullText={false}
        />
      </CardBlock>
      <CardBlock
        className={"credential-details-read-more-block"}
        flatBorder={FlatBorderType.TOP}
      >
        <ReadMore content={cardData.s.description} />
      </CardBlock>
      {joinedCredRequestMembers && joinedCredRequestMembers.length > 0 && (
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
      <CardBlock
        title={i18n.t("tabs.credentials.details.attributes.label")}
        onClick={() => setOpenDetailModal(true)}
      />

      <CardDetailsBlock title={i18n.t("tabs.credentials.details.id")}>
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-id"
        />
      </CardDetailsBlock>
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
      {cardData.a && (
        <CredentialAttributeDetailModal
          isOpen={openDetailModal}
          setOpen={setOpenDetailModal}
          title={`${i18n.t("tabs.credentials.details.attributes.label")}`}
          description={`${i18n.t(
            "tabs.credentials.details.attributes.description"
          )}`}
        >
          <ListHeader
            title={i18n.t("tabs.credentials.details.attributes.details")}
          />
          <CardBlock>
            <CardDetailsAttributes data={cardData.a as JSONObject} />
          </CardBlock>
        </CredentialAttributeDetailModal>
      )}
    </>
  );
};

export { CredentialContent };
