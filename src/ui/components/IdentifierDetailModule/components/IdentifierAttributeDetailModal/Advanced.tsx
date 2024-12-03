import {
  AccordionGroupCustomEvent,
  IonAccordion,
  IonAccordionGroup,
  IonIcon,
  IonItem,
} from "@ionic/react";
import { star } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../../../i18n";
import {
  CardBlock,
  CardDetailsContent,
  CardDetailsItem,
} from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { combineClassNames } from "../../../../utils/style";
import {
  AccordionKey,
  AdvancedProps,
} from "./IdentifierAttributeDetailModal.types";

const Advanced = ({ data, currentUserIndex }: AdvancedProps) => {
  const [isShowSigningList, setShowSigningList] = useState(false);
  const [isShowRotationKey, setShowRotationKey] = useState(false);

  const isMultisig = !!(data.groupMetadata || data.multisigManageAid);

  const signingKeys = data.k?.map((key, index) => {
    return {
      title: key,
      isCurrentUser: currentUserIndex === index || !isMultisig,
    };
  });

  const rotationKeys = data.n?.map((key) => {
    return {
      title: key,
    };
  });

  const onChange = (ev: AccordionGroupCustomEvent) => {
    setShowSigningList(ev.detail.value.includes(AccordionKey.SIGNINGKEY));
    setShowRotationKey(ev.detail.value.includes(AccordionKey.ROTATIONKEY));
  };

  return (
    <>
      <ListHeader
        title={i18n.t(
          "tabs.identifiers.details.detailmodal.advanceddetail.title"
        )}
      />
      {isMultisig && (
        <>
          <IonAccordionGroup
            data-testid="key-list"
            onIonChange={onChange}
            className="accordion-group"
            multiple
          >
            <IonAccordion
              value={AccordionKey.SIGNINGKEY}
              className="accordion"
            >
              <IonItem
                className="accordion-header"
                lines="none"
                slot="header"
              >
                <span>
                  {i18n.t(
                    `tabs.identifiers.details.detailmodal.advanceddetail.${
                      !isShowSigningList ? "viewkey" : "hidekey"
                    }`,
                    {
                      keys: data.k.length,
                    }
                  )}
                </span>
              </IonItem>
              <div
                className="list-item"
                slot="content"
              >
                {signingKeys.map((item) => (
                  <CardDetailsItem
                    key={item.title}
                    info={item.title}
                    className="member"
                    testId={`group-member-${item.title}`}
                    endSlot={
                      <div
                        className={combineClassNames("user-label", {
                          hidden: !item.isCurrentUser,
                        })}
                      >
                        <IonIcon icon={star} />
                        <span>
                          {i18n.t("tabs.identifiers.details.detailmodal.you")}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>
            </IonAccordion>
            <IonAccordion
              value={AccordionKey.ROTATIONKEY}
              className="accordion"
            >
              <IonItem
                className="accordion-header"
                slot="header"
              >
                <span>
                  {i18n.t(
                    `tabs.identifiers.details.detailmodal.advanceddetail.${
                      !isShowRotationKey ? "viewrotationkey" : "hiderotationkey"
                    }`,
                    {
                      keys: data.n.length,
                    }
                  )}
                </span>
              </IonItem>
              <div
                className="list-item"
                slot="content"
              >
                {rotationKeys.map((item) => (
                  <CardDetailsItem
                    key={item.title}
                    info={item.title}
                    className="member"
                    testId={`group-member-${item.title}`}
                  />
                ))}
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        </>
      )}
      {data.s && (
        <CardBlock
          title={i18n.t(
            "tabs.identifiers.details.keyrotation.sequencenumber.title"
          )}
        >
          <CardDetailsContent
            testId="sequence-number"
            mainContent={data.s}
            subContent={`${i18n.t(
              "tabs.identifiers.details.keyrotation.sequencenumber.lastrotate"
            )}: ${formatShortDate(data.dt)} - ${formatTimeToSec(data.dt)}`}
          />
        </CardBlock>
      )}
    </>
  );
};

export { Advanced };
