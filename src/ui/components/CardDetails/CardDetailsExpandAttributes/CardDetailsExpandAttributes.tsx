import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { CardDetailsAttribute } from "./CardDetailsAttribute";
import "./CardDetailsAttributes.scss";
import { CardDetailsExpandAttributesProps } from "./CardDetailsExpandAttributes.types";
import { i18n } from "../../../../i18n";

const CardDetailsExpandAttributes = ({
  data,
  itemProps,
  ignoreKeys = []
}: CardDetailsExpandAttributesProps) => {
  const attributes = Object.entries(data);

  return (
    <IonAccordionGroup
      data-testid="nested-attributes"
      className="attributes-accordion-group"
      multiple
    >
      <IonAccordion
        className="accordion"
      >
        <IonItem
          className="accordion-header"
          lines="none"
          slot="header"
        >
          <span>
            {i18n.t("tabs.credentials.details.attributes.title")}
          </span>
        </IonItem>
        <div slot="content" className="nested-list-item container-nested-list-item">
          {attributes.map(([key, value]) => {
            if(ignoreKeys.includes(key)) return;
        
            return <CardDetailsAttribute key={key} attributeKey={key} attributeValue={value} itemProps={itemProps} ignoreKeys={ignoreKeys}/>
          })}
        </div>
      </IonAccordion>
    </IonAccordionGroup>
  );
};

export { CardDetailsExpandAttributes };
