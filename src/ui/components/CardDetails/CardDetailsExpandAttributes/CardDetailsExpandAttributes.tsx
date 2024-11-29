import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { CardDetailsAttribute } from "./CardDetailsAttribute";
import "./CardDetailsAttributes.scss";
import { CardDetailsExpandAttributesProps } from "./CardDetailsExpandAttributes.types";

const CardDetailsExpandAttributes = ({
  data,
  itemProps,
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
            Full Access
          </span>
        </IonItem>
        <div slot="content" className="nested-list-item container-nested-list-item">
          {attributes.map(([key, value]) => {
            if(key === "i") return;
        
            return <CardDetailsAttribute key={key} attributeKey={key} attributeValue={value} itemProps={itemProps}/>
          })}
        </div>
      </IonAccordion>
    </IonAccordionGroup>
  );
};

export { CardDetailsExpandAttributes };
