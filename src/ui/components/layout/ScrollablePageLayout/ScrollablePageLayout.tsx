import { useState } from "react";
import {
  IonContent,
  IonPage,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { ScrollablePageLayoutProps } from "./ScrollablePageLayout.types";
import "./ScrollablePageLayout.scss";

const ScrollablePageLayout = ({
  header,
  pageId,
  children,
  additionalClassNames,
}: ScrollablePageLayoutProps) => {
  const [isActive, setIsActive] = useState(false);
  useIonViewDidEnter(() => {
    setIsActive(true);
  });

  useIonViewDidLeave(() => {
    setIsActive(false);
  });
  return (
    <IonPage
      data-testid={pageId}
      className={
        `scrollable-page-layout ${pageId}` +
        (!isActive ? " " + "ion-hide" : "") +
        (additionalClassNames ? ` ${additionalClassNames}` : "")
      }
    >
      {header}
      <IonContent className="scrollable-page-content">{children}</IonContent>
    </IonPage>
  );
};

export { ScrollablePageLayout };
