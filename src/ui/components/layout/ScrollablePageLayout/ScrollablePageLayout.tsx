import { useEffect, useState } from "react";
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
  activeStatus,
  children,
  customClass,
  footer,
}: ScrollablePageLayoutProps) => {
  const [isActive, setIsActive] = useState(false);
  useIonViewDidEnter(() => {
    setIsActive(true);
  });

  useIonViewDidLeave(() => {
    setIsActive(false);
  });

  useEffect(() => {
    activeStatus && setIsActive(activeStatus);
  }, [activeStatus]);

  return (
    <IonPage
      data-testid={`${pageId}-page`}
      className={
        `scrollable-page-layout ${pageId}` +
        (!isActive ? " " + "ion-hide" : "") +
        (customClass ? ` ${customClass}` : "")
      }
    >
      {header}
      <IonContent className="scrollable-page-content">{children}</IonContent>
      {footer}
    </IonPage>
  );
};

export { ScrollablePageLayout };
