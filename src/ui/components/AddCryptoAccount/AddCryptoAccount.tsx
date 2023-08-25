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
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { AddCryptoAccountsProps } from "./AddCryptoAccount.types";
import "./AddCryptoAccount.scss";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { updateReduxState } from "../../../store/utils";
import { generateSeedPhraseState } from "../../constants/dictionary";

const AddCryptoAccount = ({
  addAccountIsOpen,
  setAddAccountIsOpen,
  setChooseAccountNameIsOpen,
  idwProfileInUse,
}: AddCryptoAccountsProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);

  const handleNewAccount = (type: string) => {
    setAddAccountIsOpen(false);
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.CRYPTO, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: {
        type: type,
      },
    });
  };

  return (
    <IonModal
      isOpen={addAccountIsOpen}
      initialBreakpoint={0.35}
      breakpoints={[0, 0.35]}
      className={`page-layout${idwProfileInUse ? " short-modal" : ""}`}
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
                      setChooseAccountNameIsOpen(true);
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
                    setAddAccountIsOpen(false);
                    handleNewAccount(generateSeedPhraseState.additional);
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
                    setAddAccountIsOpen(false);
                    handleNewAccount(generateSeedPhraseState.restore);
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
