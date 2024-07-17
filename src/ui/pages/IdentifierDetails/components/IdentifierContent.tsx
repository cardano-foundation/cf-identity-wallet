import {
  calendarNumberOutline,
  personCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { IdentifierContentProps } from "./IdentifierContent.types";
import { i18n } from "../../../../i18n";
import { ConfigurationService } from "../../../../core/configuration";
import { CardDetailsBlock } from "../../../components/CardDetails/CardDetailsBlock";
import { CardDetailsItem } from "../../../components/CardDetails/CardDetailsItem";
import { BackingMode } from "../../../../core/configuration/configurationService.types";
import { useAppSelector } from "../../../../store/hooks";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";

const IdentifierContent = ({
  cardData,
  onOpenRotateKey,
}: IdentifierContentProps) => {
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [isMultiSig, setIsMultiSig] = useState(false);

  useEffect(() => {
    const identifier = identifiersData.find((data) => data.id === cardData.id);
    if (identifier && identifier.multisigManageAid) {
      setIsMultiSig(true);
    }
  }, [identifiersData, cardData.id]);

  return (
    <>
      {cardData.di !== "" && (
        <CardDetailsBlock title={i18n.t("identifiers.details.delegator.title")}>
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            textIcon="identifiers.details.delegator.icon"
            testId="delegator"
          />
        </CardDetailsBlock>
      )}
      {cardData.k.length && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.signingkeyslist.title")}
        >
          {cardData.k.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.details.signingkeyslist.icon"
                testId={`signing-key-${index}`}
                actionButton={isMultiSig ? undefined : refreshOutline}
                actionButtonClick={isMultiSig ? undefined : onOpenRotateKey}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.kt > 1 && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.signingkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.kt}`}
            copyButton={false}
            textIcon="identifiers.details.signingkeysthreshold.icon"
            testId="signing-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      {cardData.n.length && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.nextkeyslist.title")}
        >
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.details.nextkeyslist.icon"
                testId={`next-key-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.nt > 1 && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.nextkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.nt}`}
            copyButton={false}
            textIcon="identifiers.details.nextkeysthreshold.icon"
            testId="next-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock
        title={i18n.t("identifiers.details.creationtimestamp.title")}
      >
        <CardDetailsItem
          info={
            formatShortDate(cardData.createdAtUTC) +
            " - " +
            formatTimeToSec(cardData.createdAtUTC)
          }
          copyButton={false}
          icon={calendarNumberOutline}
          testId="creation-timestamp"
        />
      </CardDetailsBlock>
      {cardData.s !== "0" && cardData.dt && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.rotationtimestamp.title")}
        >
          <CardDetailsItem
            info={
              formatShortDate(cardData.dt) +
              " - " +
              formatTimeToSec(cardData.dt)
            }
            copyButton={false}
            textIcon="identifiers.details.rotationtimestamp.icon"
            testId="rotation-timestamp"
          />
        </CardDetailsBlock>
      )}
      {cardData.s !== "0" && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.sequencenumber.title")}
        >
          <CardDetailsItem
            info={`${cardData.s}`}
            copyButton={true}
            textIcon="identifiers.details.sequencenumber.icon"
            testId="sequence-number"
          />
        </CardDetailsBlock>
      )}
      {cardData.b.length > 0 && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.backerslist.title")}
        >
          {cardData.b.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.details.backerslist.icon"
                testId={`backer-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}

      {/* @TODO - foconnor: We should verify the particular identifier is ledger based, not that our config is. */}
      {ConfigurationService.env.keri.backing.mode === BackingMode.LEDGER && (
        <CardDetailsBlock
          title={i18n.t("identifiers.details.backeraddress.title")}
        >
          <CardDetailsItem
            info={ConfigurationService.env.keri.backing.ledger.address}
            copyButton={true}
            icon={personCircleOutline}
            // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
            testId="backer-address"
          />
        </CardDetailsBlock>
      )}
    </>
  );
};

export { IdentifierContent };
