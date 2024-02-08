import { IonButton, IonIcon } from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { writeToClipboard } from "../../utils/clipboard";
import { CardDetailsItemProps } from "./CardDetailsElements.types";
import { useAppDispatch } from "../../../store/hooks";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { i18n } from "../../../i18n";

const CardDetailsItem = ({
  info,
  copyButton,
  icon,
  keyValue,
  textIcon,
  testId,
}: CardDetailsItemProps) => {
  const dispatch = useAppDispatch();
  return (
    <span
      className="card-details-info-block-line"
      data-testid={testId}
      onClick={() => {
        if (copyButton) {
          writeToClipboard(info);
          dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
        }
      }}
    >
      {icon && (
        <span className="card-details-info-block-icon">
          <IonIcon
            slot="icon-only"
            icon={icon}
            color="primary"
          />
        </span>
      )}
      {keyValue && <strong>{keyValue}</strong>}
      {textIcon && (
        <span className="card-details-info-block-text-icon">
          {i18n.t(textIcon)}
        </span>
      )}
      <span className="card-details-info-block-data">{info}</span>
      {copyButton && (
        <span>
          <IonButton
            shape="round"
            className="copy-button"
          >
            <IonIcon
              slot="icon-only"
              icon={copyOutline}
            />
          </IonButton>
        </span>
      )}
    </span>
  );
};

export { CardDetailsItem };
