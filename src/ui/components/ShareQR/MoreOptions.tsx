import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { Share } from "@capacitor/share";
import { openOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";

const MoreOptions = ({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <span
            className="share-qr-modal-option"
            data-testid="share-qr-modal-share-button"
            onClick={async () => {
              if (onClick) onClick();
              await Share.share({
                text: text,
              });
            }}
          >
            <span>
              <IonButton shape="round">
                <IonIcon
                  slot="icon-only"
                  icon={openOutline}
                />
              </IonButton>
            </span>
            <span className="share-qr-modal-info-block-data">
              {i18n.t("shareqr.more")}
            </span>
          </span>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export { MoreOptions };
