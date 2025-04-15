import { useEffect, useState } from "react";
import {
  IonPage,
  isPlatform,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { ResponsivePageLayoutProps } from "./ResponsivePageLayout.types";
import "./ResponsivePageLayout.scss";
import { combineClassNames } from "../../../utils/style";

const ResponsivePageLayout = ({
  header,
  pageId,
  activeStatus,
  children,
  customClass,
}: ResponsivePageLayoutProps) => {
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
    `responsive-page-layout ${pageId}`,
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
      <div className="responsive-page-content">{children}</div>
    </IonPage>
  );
};

export { ResponsivePageLayout };
