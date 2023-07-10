import { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  arrowUpOutline,
  arrowDownOutline,
  imageOutline,
  cashOutline,
  codeSlashOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import {
  CryptoAssetsProps,
  CryptoTransactionsProps,
} from "../../pages/Crypto/Crypto.types";
import "./AssetsTransactions.scss";
import { formatDate, formatTime } from "../../../utils";

interface AssetTransactionItemProps {
  key: number;
  asset?: CryptoAssetsProps;
  transaction?: CryptoTransactionsProps;
  index: number;
}

const AssetItem = ({ asset, index }: AssetTransactionItemProps) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="asset-logo"
          >
            <img
              src={asset?.logo}
              alt="asset-logo"
            />
          </IonCol>
          <IonCol
            size="5.5"
            className="asset-info"
          >
            <IonLabel className="asset-name">{asset?.name}</IonLabel>
            <IonLabel className="asset-rate">
              {asset?.currentPrice} {asset?.performance}%
            </IonLabel>
          </IonCol>
          <IonCol
            size="4"
            className="account-balance"
          >
            <IonLabel>{asset?.balance.toFixed(2) + " ADA"}</IonLabel>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

const TransactionItem = ({ transaction, index }: AssetTransactionItemProps) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="transaction-icon"
          >
            <IonButton
              shape="round"
              color={`transparent ${transaction?.operation}`}
            >
              {transaction?.operation === "send" ? (
                <IonIcon
                  slot="icon-only"
                  icon={arrowUpOutline}
                  color="danger"
                />
              ) : (
                <IonIcon
                  slot="icon-only"
                  icon={arrowDownOutline}
                  color="green"
                />
              )}
            </IonButton>
          </IonCol>
          <IonCol
            size="5.5"
            className="transaction-info"
          >
            <IonLabel>
              <span className="transaction-address">
                {transaction?.address.substring(0, 4)}...
                {transaction?.address.slice(-4)}
              </span>

              {transaction?.type.map((type: string, index) => {
                let icon;
                switch (type) {
                  case "assets":
                    icon = cashOutline;
                    break;
                  case "nfts":
                    icon = imageOutline;
                    break;
                  case "metadata":
                    icon = codeSlashOutline;
                    break;
                  default:
                    break;
                }
                return (
                  <IonIcon
                    key={index}
                    slot="icon-only"
                    icon={icon}
                    className="transaction-type"
                  />
                );
              })}
            </IonLabel>
            <IonLabel className="transaction-time">
              {formatDate(`${transaction?.timestamp}`) +
                " | " +
                formatTime(`${transaction?.timestamp}`)}
            </IonLabel>
          </IonCol>
          <IonCol
            size="4"
            className="transaction-outcome"
          >
            {transaction?.operation === "send" ? (
              <IonLabel>{transaction?.amount.toFixed(2) + " ADA"}</IonLabel>
            ) : (
              <IonLabel color="dark-green">
                +{transaction?.amount.toFixed(2) + " ADA"}
              </IonLabel>
            )}
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
  const [selectedTab, setSelectedTab] = useState("assets");
  useEffect(() => {
    if (!expanded) {
      setSelectedTab("assets");
    }
  }, [expanded]);
  return (
    <div className="assets-transactions-body modal">
      <PageLayout>
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className=""
            >
              <IonLabel
                className={`assets-transactions-swipe-message ${
                  expanded ? "hide" : "show"
                }`}
              >
                {i18n.t("crypto.tab.assetstransactions.swipeupmessage")}
              </IonLabel>
              <IonSegment
                className={`assets-transactions-toggle-segment ${
                  expanded ? "show" : "hide"
                }`}
                data-testid="assets-transactions-toggle-segment"
                value={selectedTab}
                onIonChange={(event) => {
                  setSelectedTab(`${event.detail.value}`);
                }}
              >
                <IonSegmentButton value="assets">
                  <IonLabel>
                    {i18n.t("crypto.tab.assetstransactions.assets")}
                  </IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="transactions">
                  <IonLabel>
                    {i18n.t("crypto.tab.assetstransactions.transactions")}
                  </IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol
              size="12"
              className=""
            >
              {selectedTab === "assets" && assets.length && (
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
              )}
              {selectedTab === "transactions" && transactions.length && (
                <IonList
                  lines="none"
                  className="transactions-list"
                >
                  {transactions.map((transaction, index) => {
                    return (
                      <TransactionItem
                        key={index}
                        transaction={transaction}
                        index={index}
                      />
                    );
                  })}
                </IonList>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </div>
  );
};

export { AssetsTransactions };
