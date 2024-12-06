import {
  calendarNumberOutline,
  informationCircleOutline,
  keyOutline,
} from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../../i18n";
import { useAppSelector } from "../../../../store/hooks";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import {
  CardBlock,
  CardDetailsBlock,
  CardDetailsItem,
  FlatBorderType
} from "../../CardDetails";
import { IdentifierDetailModal } from "../../IdentifierDetailModule";
import { ListHeader } from "../../ListHeader";
import { ReadMore } from "../../ReadMore";
import { CredentialAttributeContent, CredentialAttributeDetailModal } from "./CredentialAttributeDetailModal";
import { CredentialContentProps } from "./CredentialContent.types";
import { MultisigMember } from "./MultisigMember";
import { MemberAcceptStatus } from "./MultisigMember.types";

const CredentialContent = ({
  cardData,
  joinedCredRequestMembers,
  connectionShortDetails,
  setOpenConnectionlModal,
}: CredentialContentProps) => {
  const identifiers = useAppSelector(getIdentifiersCache);

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openIdentifierDetail, setOpenIdentifierDetail] = useState(false);

  const identifier = identifiers.find(item => item.id === cardData.identifierId);

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
      <ListHeader
        title={i18n.t("tabs.credentials.details.credentialdetails")}
      />
      <CardBlock
        title={i18n.t("tabs.credentials.details.status.issued")}
        testId={"credential-issued-label"}
      >
        <CardDetailsItem
          keyValue={formatShortDate(cardData.a.dt)}
          info={formatTimeToSec(cardData.a.dt)}
          testId={"credential-issued-section"}
          icon={calendarNumberOutline}
          className="credential-issued-section"
          mask={false}
          fullText
        />
      </CardBlock>
      <CardBlock
        title={i18n.t("tabs.credentials.details.issuer")}
        onClick={() => setOpenConnectionlModal(true)}
      >
        <CardDetailsItem
          info={connectionShortDetails ? connectionShortDetails.label : i18n.t("connections.unknown")}
          customIcon={KeriLogo}
          className="member"
          testId={"credential-details-issuer"}
        />
      </CardBlock>
      <div className="credential-details-split-section">
        <CardBlock
          copyContent={cardData.id}
          title={i18n.t("tabs.credentials.details.id")}
          testId={"credential-details-id-block"}
        >
          <CardDetailsItem
            info={`${cardData.id.substring(0, 5)}...${cardData.id.slice(-5)}`}
            icon={keyOutline}
            testId={"credential-details-id"}
            className="credential-details-id"
            mask={false}
          />
        </CardBlock>
        <CardBlock title={i18n.t("tabs.credentials.details.schemaversion")}>
          <h2 data-testid="credential-details-schema-version">
            {cardData.s.version}
          </h2>
        </CardBlock>
      </div>
      <CardBlock
        title={i18n.t("tabs.credentials.details.status.label")}
        testId={"credential-details-last-status-label"}
      >
        <h2 data-testid="credential-details-last-status">
          {cardData.lastStatus.s === "0"
            ? i18n.t("tabs.credentials.details.status.issued")
            : i18n.t("tabs.credentials.details.status.revoked")}
        </h2>
        <p data-testid="credential-details-last-status-timestamp">
          {`${i18n.t(
            "tabs.credentials.details.status.timestamp"
          )} ${formatShortDate(cardData.lastStatus.dt)} - ${formatTimeToSec(
            cardData.lastStatus.dt
          )}`}
        </p>
      </CardBlock>

      {cardData.a && (
        <CredentialAttributeDetailModal
          isOpen={openDetailModal}
          setOpen={setOpenDetailModal}
          title={`${i18n.t("tabs.credentials.details.attributes.label")}`}
          description={`${i18n.t(
            "tabs.credentials.details.attributes.description"
          )}`}
        >
          <CredentialAttributeContent data={cardData} />
        </CredentialAttributeDetailModal>
      )}
      {identifier && <CardBlock
        title={i18n.t("tabs.credentials.details.relatedidentifier")}
        onClick={() => setOpenIdentifierDetail(true)}
        testId="related-identifier-section"
      >
        <CardDetailsItem
          info={identifier?.displayName || ""}
          customIcon={KeriLogo}
          className="related-identifier"
          testId="related-identifier-name"
        />
      </CardBlock>}
      <IdentifierDetailModal
        isOpen={openIdentifierDetail}
        setIsOpen={setOpenIdentifierDetail}
        identifierDetailId={cardData.identifierId}
        pageId="credential-related-identifier"
      />
    </>
  );
};

export { CredentialContent };
