import {
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from "@ionic/react";
import {
  repeatOutline,
  addCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { AddCryptoAccountsProps } from "./AddCryptoAccount.types";

const AddCryptoAccount = ({
  addAccountIsOpen,
  setAddAccountIsOpen,
  setShowVerifyPassword,
  idwProfileInUse,
}: AddCryptoAccountsProps) => {
  return (
    <IonModal
      isOpen={addAccountIsOpen}
      initialBreakpoint={0.35}
      breakpoints={[0, 0.35]}
      className="page-layout"
      data-testid="add-crypto-account"
      onDidDismiss={() => setAddAccountIsOpen(false)}
    >
      <div className="add-crypto-account modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("crypto.addcryptoaccountmodal.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="add-crypto-account-body"
              >
                {!idwProfileInUse && (
                  <span
                    className="add-crypto-account-option"
                    data-testid="add-crypto-account-reuse-button"
                    onClick={() => {
                      setAddAccountIsOpen(false);
                      setShowVerifyPassword(true);
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={repeatOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="add-crypto-account-label">
                      {i18n.t("crypto.addcryptoaccountmodal.reuse")}
                    </span>
                  </span>
                )}
                <span
                  className="add-crypto-account-option"
                  data-testid="add-crypto-account-generate-button"
                  onClick={() => {
                    return;
                  }}
                >
                  <span>
                    <IonButton shape="round">
                      <IonIcon
                        slot="icon-only"
                        icon={addCircleOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="add-crypto-account-label">
                    {i18n.t("crypto.addcryptoaccountmodal.generate")}
                  </span>
                </span>
                <span
                  className="add-crypto-account-option"
                  data-testid="add-crypto-account-restore-button"
                  onClick={() => {
                    return;
                  }}
                >
                  <span>
                    <IonButton shape="round">
                      <IonIcon
                        slot="icon-only"
                        icon={refreshOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="add-crypto-account-label">
                    {i18n.t("crypto.addcryptoaccountmodal.restore")}
                  </span>
                </span>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { AddCryptoAccount };
