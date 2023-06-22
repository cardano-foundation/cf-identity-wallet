import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { useState } from "react";
import { walletOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { getCryptoAccountsCache } from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";

const Crypto = () => {
  const dispatch = useAppDispatch();
  const cryptoAccountsData = useAppSelector(getCryptoAccountsCache);
  const [accountIsOpen, setAccountsIsOpen] = useState(false);

  const handleAddCryptoAccount = () => {
    //
  };

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }))
  );

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="share-button"
        data-testid="share-button"
        onClick={() => {
          setAccountsIsOpen(true);
        }}
      >
        <IonIcon
          slot="icon-only"
          icon={walletOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  return (
    <IonPage
      className="tab-layout"
      data-testid="crypto-tab"
    >
      <TabLayout
        header={true}
        title=""
        menuButton={true}
        additionalButtons={<AdditionalButtons />}
      >
        {cryptoAccountsData.length ? (
          <div>Account page here</div>
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("crypto.tab.create")}
            buttonAction={handleAddCryptoAccount}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Crypto };
