import {
  calendarNumberOutline,
  keyOutline,
  personCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { IdentifierContentProps } from "./IdentifierContent.types";
import { i18n } from "../../../../i18n";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { ConfigurationService } from "../../../../core/configuration";
import { CardDetailsBlock } from "../../../components/CardDetails/CardDetailsBlock";
import { CardDetailsItem } from "../../../components/CardDetails/CardDetailsItem";
import { BackingMode } from "../../../../core/configuration/configurationService.types";
import { useAppSelector } from "../../../../store/hooks";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";
import { getMultisigConnectionsCache } from "../../../../store/reducers/connectionsCache";
import { getAuthentication } from "../../../../store/reducers/stateCache";

const IdentifierContent = ({
  cardData,
  onOpenRotateKey,
}: IdentifierContentProps) => {
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [isMultiSig, setIsMultiSig] = useState(false);
  const userName = useAppSelector(getAuthentication)?.userName;
  const multisignConnectionsCache = useAppSelector(getMultisigConnectionsCache);

  useEffect(() => {
    if (cardData.multisigManageAid) {
      setIsMultiSig(true);
      return;
    }

    const identifier = identifiersData.find((data) => data.id === cardData.id);
    if (identifier && identifier.multisigManageAid) {
      setIsMultiSig(true);
    }
  }, [identifiersData, cardData.id, cardData.multisigManageAid]);

  const members = useMemo(() => {
    return cardData.members?.map((member) => {
      const memberConnection = multisignConnectionsCache[member];
      let name = memberConnection?.label || member;

      if (!memberConnection?.label) {
        name = userName;
      }

      return name;
    });
  }, [cardData.members, multisignConnectionsCache, userName]);

  const RotateActionButton = () => {
    return (
      <IonButton
        slot="end"
        shape="round"
        className="rotate-keys-button"
        data-testid={"rotate-keys-button"}
        onClick={onOpenRotateKey}
      >
        <h4>{i18n.t("tabs.identifiers.details.signingkeyslist.rotate")}</h4>
        <IonIcon icon={refreshOutline} />
      </IonButton>
    );
  };

  return (
    <>
      {isMultiSig && members && (
        <>
          <CardDetailsBlock
            title={i18n.t("tabs.identifiers.details.groupmembers.title")}
          >
            {members.map((item, index) => {
              return (
                <CardDetailsItem
                  key={index}
                  info={item}
                  customIcon={KeriLogo}
                  testId={`group-member-${index}`}
                />
              );
            })}
          </CardDetailsBlock>
          {cardData.kt && (
            <CardDetailsBlock
              title={i18n.t(
                "tabs.identifiers.details.signingkeysthreshold.title"
              )}
            >
              <CardDetailsItem
                info={`${cardData.kt}`}
                testId="signing-keys-threshold"
              />
            </CardDetailsBlock>
          )}
        </>
      )}
      <CardDetailsBlock
        title={i18n.t("tabs.identifiers.details.information.title")}
      >
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="identifier"
        />
        <CardDetailsItem
          info={
            formatShortDate(cardData.createdAtUTC) +
            " - " +
            formatTimeToSec(cardData.createdAtUTC)
          }
          icon={calendarNumberOutline}
          testId="creation-timestamp"
        />
      </CardDetailsBlock>
      {cardData.k.length && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.signingkeyslist.title")}
          action={isMultiSig ? undefined : <RotateActionButton />}
        >
          {cardData.k.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`signing-key-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.n.length && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.nextkeyslist.title")}
        >
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`next-key-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {isMultiSig && cardData.nt && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.nextkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.nt}`}
            testId="next-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      {cardData.s && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.sequencenumber.title")}
        >
          <CardDetailsItem
            info={`${cardData.s}`}
            testId="sequence-number"
          />
        </CardDetailsBlock>
      )}
      {cardData.dt && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.rotationtimestamp.title")}
        >
          <CardDetailsItem
            info={
              formatShortDate(cardData.dt) +
              " - " +
              formatTimeToSec(cardData.dt)
            }
            testId="rotation-timestamp"
          />
        </CardDetailsBlock>
      )}

      {/* @TODO - sdisalvo: START: The following 3 sections will need to be removed/refactored */}

      {cardData.b.length > 0 && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.backerslist.title")}
        >
          {cardData.b.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`backer-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}

      {/* @TODO - foconnor: We should verify the particular identifier is ledger based, not that our config is. */}
      {ConfigurationService.env.keri.backing.mode === BackingMode.LEDGER && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.backeraddress.title")}
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

      {cardData.di !== "" && cardData.di && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.delegator.title")}
        >
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            testId="delegator"
          />
        </CardDetailsBlock>
      )}
      {/* @TODO - sdisalvo: END: The above 3 sections will need to be removed/refactored */}
    </>
  );
};

export { IdentifierContent };
