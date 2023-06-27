import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonModal,
  IonRow,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { MyWalletsProps } from "./MyWallets.types";

const MyWallets = ({
  myWalletsIsOpen,
  setMyWalletsIsOpen,
  setAddAccountIsOpen,
}: MyWalletsProps) => {
  return (
    <IonModal
      isOpen={myWalletsIsOpen}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      className="page-layout"
      data-testid="my-wallets"
      onDidDismiss={() => setMyWalletsIsOpen(false)}
    >
      <div className="my-wallets modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("crypto.mywalletsmodal.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="my-wallets-body"
              >
                <i>{i18n.t("crypto.mywalletsmodal.empty")}</i>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="my-wallets-footer"
              >
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  onClick={() => {
                    setMyWalletsIsOpen(false);
                    setAddAccountIsOpen(true);
                  }}
                >
                  <IonIcon
                    slot="icon-only"
                    size="small"
                    icon={addOutline}
                    color="primary"
                  />
                  {i18n.t("crypto.mywalletsmodal.create")}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { MyWallets };
