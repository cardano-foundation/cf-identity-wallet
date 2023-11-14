import { IonPage } from "@ionic/react";
import { ResponsivePageLayoutProps } from "./ResponsivePageLayout.types";
import "./ResponsivePageLayout.scss";

const ResponsivePageLayout = ({
  title,
  children,
}: ResponsivePageLayoutProps) => {
  return (
    <IonPage
      className={`responsive-page-layout safe-area ${title}`}
      data-testid={title}
    >
      <div className="responsive-page-content">{children}</div>
    </IonPage>
  );
};

export { ResponsivePageLayout };
