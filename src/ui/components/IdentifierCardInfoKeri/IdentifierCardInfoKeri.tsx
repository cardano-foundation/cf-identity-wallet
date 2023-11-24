import { calendarNumberOutline, personCircleOutline } from "ionicons/icons";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { IdentifierCardInfoKeriProps } from "./IdentifierCardInfoKeri.types";
import { SignifyApi } from "../../../core/agent/modules/signify/signifyApi";
import { CardDetailsBlock, CardDetailsItem } from "../CardDetailsElements";

const IdentifierCardInfoKeri = ({ cardData }: IdentifierCardInfoKeriProps) => {
  return (
    <>
      {cardData.di !== "" && (
        <CardDetailsBlock title="identifiers.card.details.delegator.title">
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            textIcon="identifiers.card.details.delegator.icon"
            testId="delegator-copy-button"
          />
        </CardDetailsBlock>
      )}
      {cardData.k.length && (
        <CardDetailsBlock title="identifiers.card.details.signingkeyslist.title">
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
        </CardDetailsBlock>
      )}
      {cardData.kt > 1 && (
        <CardDetailsBlock title="identifiers.card.details.signingkeysthreshold.title">
          <CardDetailsItem
            info={`${cardData.kt}`}
            copyButton={false}
            textIcon="identifiers.card.details.signingkeysthreshold.icon"
            testId="signing-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      {cardData.n.length && (
        <CardDetailsBlock title="identifiers.card.details.nextkeyslist.title">
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
        </CardDetailsBlock>
      )}
      {cardData.nt > 1 && (
        <CardDetailsBlock title="identifiers.card.details.nextkeysthreshold.title">
          <CardDetailsItem
            info={`${cardData.nt}`}
            copyButton={false}
            textIcon="identifiers.card.details.nextkeysthreshold.icon"
            testId="next-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title="identifiers.card.details.creationtimestamp.title">
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
      {cardData.s > 0 && cardData.dt && (
        <CardDetailsBlock title="identifiers.card.details.rotationtimestamp.title">
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
        </CardDetailsBlock>
      )}
      {cardData.s > 0 && (
        <CardDetailsBlock title="identifiers.card.details.sequencenumber.title">
          <CardDetailsItem
            info={`${cardData.s}`}
            copyButton={true}
            textIcon="identifiers.card.details.sequencenumber.icon"
            testId="sequence-number"
          />
        </CardDetailsBlock>
      )}
      {cardData.b.length && (
        <CardDetailsBlock title="identifiers.card.details.backerslist.title">
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
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title="identifiers.card.details.backeraddress.title">
        <CardDetailsItem
          info={SignifyApi.BACKER_ADDRESS}
          copyButton={true}
          icon={personCircleOutline}
          // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
          testId="copy-button-backer-address"
        />
      </CardDetailsBlock>
    </>
  );
};

export { IdentifierCardInfoKeri };
