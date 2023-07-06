import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
} from "@ionic/react";
import { menuOutline } from "ionicons/icons";
import "./TabLayout.scss";
import { TabLayoutProps } from "./TabLayout.types";

const TabLayout = ({
  header,
  avatar,
  title,
  titleSize,
  titleAction,
  menuButton,
  additionalButtons,
  children,
}: TabLayoutProps) => {
  return (
    <>
      {header && (
        <IonHeader className="ion-no-border tab-header">
          <IonToolbar color="transparent">
            {avatar && <IonButtons slot="start">{avatar}</IonButtons>}

            {title && (
              <IonTitle
                onClick={titleAction}
                data-testid={`tab-title-${title.toLowerCase()}`}
              >
                {(titleSize === "h2" || !titleSize) && <h2>{title}</h2>}
                {titleSize === "h3" && <h3>{title}</h3>}
              </IonTitle>
            )}

            <IonButtons slot="end">
              {additionalButtons}

              {menuButton && (
                <IonButton
                  shape="round"
                  className="menu-button"
                  data-testid="menu-button"
                >
                  <IonIcon
                    slot="icon-only"
                    icon={menuOutline}
                    color="primary"
                  />
                </IonButton>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent
        className="tab-content"
        color="transparent"
      >
        {children}
      </IonContent>
    </>
  );
};

export { TabLayout };
