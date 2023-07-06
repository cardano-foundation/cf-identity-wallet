import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import {
  CryptoAssetsProps,
  CryptoTransactionsProps,
} from "../../pages/Crypto/Crypto.types";
import "./AssetsTransactions.scss";

interface AssetItemProps {
  key: number;
  asset: CryptoAssetsProps;
  index: number;
}

const AssetItem = ({ asset, index }: AssetItemProps) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="asset-logo"
          >
            <img
              src={asset.logo}
              alt="asset-logo"
            />
          </IonCol>
          <IonCol
            size="5.5"
            className="asset-info"
          >
            <IonLabel className="asset-name">{asset.name}</IonLabel>
            <IonLabel className="asset-rate">
              {asset.currentPrice} {asset.performance}%
            </IonLabel>
          </IonCol>
          <IonCol
            size="4"
            className="account-balance"
          >
            <IonLabel>{asset.balance.toFixed(2) + " ADA"}</IonLabel>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

interface AssetsTransactionsProps {
  assets: CryptoAssetsProps[];
  transactions: CryptoTransactionsProps[];
  expanded: boolean;
}

const AssetsTransactions = ({
  assets,
  transactions,
  expanded,
}: AssetsTransactionsProps) => {
  return (
    <div className="assets-transactions-body modal">
      <PageLayout>
        {expanded ? "" : i18n.t("crypto.tab.assetstransactions.swipeupmessage")}
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="my-wallets-body"
            >
              {assets.length ? (
                <IonList
                  lines="none"
                  className="assets-list"
                >
                  {assets.map((asset, index) => {
                    return (
                      <AssetItem
                        key={index}
                        asset={asset}
                        index={index}
                      />
                    );
                  })}
                </IonList>
              ) : (
                <i>{i18n.t("crypto.mywalletsmodal.empty")}</i>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </div>
  );
};

export { AssetsTransactions };
