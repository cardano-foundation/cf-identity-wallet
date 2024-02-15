import { useEffect, useState } from "react";
import { IonPage, useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import { ResponsivePageLayoutProps } from "./ResponsivePageLayout.types";
import "./ResponsivePageLayout.scss";

const ResponsivePageLayout = ({
  header,
  pageId,
  activeStatus,
  children,
  additionalClassNames,
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

  return (
    <IonPage
      data-testid={pageId}
      className={
        `responsive-page-layout ${pageId}` +
        (!isActive ? " " + "ion-hide" : "") +
        (additionalClassNames ? ` ${additionalClassNames}` : "")
      }
    >
      {header}
      <div className="responsive-page-content">{children}</div>
    </IonPage>
  );
};

export { ResponsivePageLayout };
