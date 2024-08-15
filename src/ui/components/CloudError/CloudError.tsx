import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import { CloudErrorProps } from "./CloudError.types";
import "./CloudError.scss";
// eslint-disable-next-line import/order
import { IonCard } from "@ionic/react";

const CloudError = ({ pageId, header, children }: CloudErrorProps) => {
  return (
    <ResponsivePageLayout
      pageId={`${pageId}-cloud-error`}
      header={header}
      activeStatus={true}
      customClass={""}
    >
      <IonCard>
        <p>
          We couldn’t locate this connection in the cloud. It might become
          available again soon, but some information could be lost. If you no
          longer require this connection, tap “Delete connection” to remove.
        </p>
      </IonCard>
      {children}
    </ResponsivePageLayout>
  );
};

export { CloudError };
