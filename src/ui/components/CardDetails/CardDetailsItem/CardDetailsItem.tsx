import { IonButton, IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
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
  keyValue,
  textIcon,
  testId,
  infoTestId,
  className,
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

  return (
    <IonItem
      lines="none"
      className={ionItemClass}
      data-testid={testId}
      onClick={() => {
        if (copyButton) {
          writeToClipboard(info);
          dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
        }
      }}
    >
      {icon && (
        <IonIcon
          className="card-details-info-block-line-start-icon"
          icon={icon}
          slot="start"
        ></IonIcon>
      )}
      {textIcon && (
        <IonText
          slot="start"
          className="card-details-info-block-text-icon"
        >
          {i18n.t(textIcon)}
        </IonText>
      )}
      <div className="card-details-info-content">
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
            className="copy-button"
            data-testid={`${testId}-copy-button`}
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
        )}
      </div>
    </IonItem>
  );
};

export { CardDetailsItem };
