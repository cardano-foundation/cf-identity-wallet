import { IonContent, IonPage } from "@ionic/react";
import { ScrollablePageLayoutProps } from "./ScrollablePageLayout.types";
import "./ScrollablePageLayout.scss";

const ScrollablePageLayout = ({
  header,
  pageId,
  children,
}: ScrollablePageLayoutProps) => {
  return (
    <IonPage
      className={`scrollable-page-layout ${pageId}`}
      data-testid={pageId}
    >
      {header}
      <IonContent className="scrollable-page-content">{children}</IonContent>
    </IonPage>
  );
};

export { ScrollablePageLayout };
