import { IonButton, IonIcon, IonItem, IonText } from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { ToastMsgType } from "../../../globals/types";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../../store/hooks";
import { CardDetailsItemProps } from "./CardDetailsItem.types";
import { writeToClipboard } from "../../../utils/clipboard";
import "./CardDetailsItem.scss";
import { combineClassNames } from "../../../utils/style";

const CardDetailsItem = ({
  info,
  copyButton,
  icon,
  customIcon,
  keyValue,
  testId,
  className,
  fullText = false,
  mask = true,
}: CardDetailsItemProps) => {
  const dispatch = useAppDispatch();

  const ionItemClass = combineClassNames(
    "card-details-info-block-line",
    className
  );
  const textClass = combineClassNames("card-details-info-block-data", {
    "card-details-info-block-subtext": !!keyValue,
    mask: mask,
  });

  const contentClass = combineClassNames("card-details-info-content", {
    "no-hide-overflow": !!fullText && !copyButton,
  });

  const copy = () => {
    writeToClipboard(info);
    dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
  };

  return (
    <IonItem
      lines="none"
      className={ionItemClass}
      data-testid={testId}
    >
      {icon && (
        <IonIcon
          className="card-details-info-block-line-start-icon"
          icon={icon}
          slot="start"
        />
      )}
      {customIcon && (
        <img
          className="card-details-info-block-line-start-icon"
          slot="start"
          src={customIcon}
          alt="keri"
        />
      )}
      <div className={contentClass}>
        <IonText
          className={textClass}
          data-testid={`${testId}-text-value`}
        >
          {keyValue && (
            <IonText className="card-details-info-block-key">
              {keyValue}
            </IonText>
          )}
          {info}
        </IonText>
        {copyButton && (
          <IonButton
            slot="end"
            shape="round"
            className="action-button"
            data-testid={`${testId}-copy-button`}
            onClick={copy}
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
        )}
      </div>
    </IonItem>
  );
};

export { CardDetailsItem };
