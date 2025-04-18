import { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  isPlatform,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { ScrollablePageLayoutProps } from "./ScrollablePageLayout.types";
import "./ScrollablePageLayout.scss";
import { combineClassNames } from "../../../utils/style";

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

  const className = combineClassNames(
    `scrollable-page-layout ${pageId}`,
    customClass,
    {
      "ion-hide": !isActive,
      md: isPlatform("android"),
    }
  );

  return (
    <IonPage
      data-testid={`${pageId}-page`}
      className={className}
    >
      {header}
      <IonContent className="scrollable-page-content">{children}</IonContent>
      {footer}
    </IonPage>
  );
};

export { ScrollablePageLayout };
