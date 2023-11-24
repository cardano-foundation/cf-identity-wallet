import { IonPage } from "@ionic/react";
import { ResponsivePageLayoutProps } from "./ResponsivePageLayout.types";
import "./ResponsivePageLayout.scss";

const ResponsivePageLayout = ({
  header,
  pageId,
  children,
}: ResponsivePageLayoutProps) => {
  return (
    <IonPage
      className={`responsive-page-layout ${pageId}`}
      data-testid={pageId}
    >
      {header}
      <div className="responsive-page-content">{children}</div>
    </IonPage>
  );
};

export { ResponsivePageLayout };
