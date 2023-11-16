import { IonPage } from "@ionic/react";
import { ResponsivePageLayoutProps } from "./ResponsivePageLayout.types";
import "./ResponsivePageLayout.scss";

const ResponsivePageLayout = ({
  header,
  title,
  children,
}: ResponsivePageLayoutProps) => {
  return (
    <IonPage
      className={`responsive-page-layout ${title}`}
      data-testid={title}
    >
      {header}
      <div className="responsive-page-content">{children}</div>
    </IonPage>
  );
};

export { ResponsivePageLayout };
