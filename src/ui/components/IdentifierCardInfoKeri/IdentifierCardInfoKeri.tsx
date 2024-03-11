import { calendarNumberOutline, personCircleOutline } from "ionicons/icons";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { IdentifierCardInfoKeriProps } from "./IdentifierCardInfoKeri.types";
import { SignifyApi } from "../../../core/agent/modules/signify/signifyApi";
import { CardDetailsInfoBlock, CardDetailsItem } from "../CardDetailsElements";
import { i18n } from "../../../i18n";
import { ConfigurationService } from "../../../core/configuration";
import { WitnessMode } from "../../../core/configuration/configurationService.types";

const IdentifierCardInfoKeri = ({ cardData }: IdentifierCardInfoKeriProps) => {
  return (
    <>
      {cardData.di !== "" && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.delegator.title")}
        >
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            textIcon="identifiers.card.details.delegator.icon"
            testId="delegator-copy-button"
          />
        </CardDetailsInfoBlock>
      )}
      {cardData.k.length && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.signingkeyslist.title")}
        >
          {cardData.k.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.card.details.signingkeyslist.icon"
                testId={`signing-keys-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsInfoBlock>
      )}
      {cardData.kt > 1 && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.signingkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.kt}`}
            copyButton={false}
            textIcon="identifiers.card.details.signingkeysthreshold.icon"
            testId="signing-keys-threshold"
          />
        </CardDetailsInfoBlock>
      )}
      {cardData.n.length && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.nextkeyslist.title")}
        >
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.card.details.nextkeyslist.icon"
                testId={`next-keys-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsInfoBlock>
      )}
      {cardData.nt > 1 && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.nextkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.nt}`}
            copyButton={false}
            textIcon="identifiers.card.details.nextkeysthreshold.icon"
            testId="next-keys-threshold"
          />
        </CardDetailsInfoBlock>
      )}
      <CardDetailsInfoBlock
        title={i18n.t("identifiers.card.details.creationtimestamp.title")}
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
      </CardDetailsInfoBlock>
      {cardData.s > 0 && cardData.dt && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.rotationtimestamp.title")}
        >
          <CardDetailsItem
            info={
              formatShortDate(cardData.dt) +
              " - " +
              formatTimeToSec(cardData.dt)
            }
            copyButton={false}
            textIcon="identifiers.card.details.rotationtimestamp.icon"
            testId="rotation-timestamp"
          />
        </CardDetailsInfoBlock>
      )}
      {cardData.s > 0 && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.sequencenumber.title")}
        >
          <CardDetailsItem
            info={`${cardData.s}`}
            copyButton={true}
            textIcon="identifiers.card.details.sequencenumber.icon"
            testId="sequence-number"
          />
        </CardDetailsInfoBlock>
      )}
      {cardData.b.length && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.backerslist.title")}
        >
          {cardData.b.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identifiers.card.details.backerslist.icon"
                testId={`backers-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsInfoBlock>
      )}

      {ConfigurationService.env.keri.backerType === WitnessMode.LEDGER && (
        <CardDetailsInfoBlock
          title={i18n.t("identifiers.card.details.backeraddress.title")}
        >
          <CardDetailsItem
            info={ConfigurationService.env.keri.ledger.address}
            copyButton={true}
            icon={personCircleOutline}
            // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
            testId="copy-button-backer-address"
          />
        </CardDetailsInfoBlock>
      )}
    </>
  );
};

export { IdentifierCardInfoKeri };
