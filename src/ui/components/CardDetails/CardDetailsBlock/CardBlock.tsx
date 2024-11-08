import { IonButton, IonIcon } from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { combineClassNames } from "../../../utils/style";
import { CardDetailsItem } from "../CardDetailsItem";
import { CardDetailsBlock } from "./CardDetailsBlock";
import { CardBlockProps, FlatBorderType } from "./CardDetailsBlock.types";

const CardBlock = ({ children, title, onClick, testId, flatBorder, className, copyContent }: CardBlockProps) => {
  const classes = combineClassNames("card-block", className, {
    "flat-border-bot": flatBorder === FlatBorderType.BOT,
    "flat-border-top": flatBorder === FlatBorderType.TOP,
    "has-content": !!children
  })

  return (
    <CardDetailsBlock onClick={!copyContent ? onClick : undefined} className={classes}>
      {title && <CardDetailsItem testId={testId} className="card-header" copyContent={copyContent} info={title} copyButton={!!copyContent} endSlot={(!copyContent && onClick)&&
        <IonButton
          slot="end"
          shape="round"
          className="action-button"
          data-testid={`${testId}-nav-button`}
        >
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      }/>}
      {children}
    </CardDetailsBlock>
  )
}

export { CardBlock };
