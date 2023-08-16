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
  IonSearchbar,
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
import { formatLongDate, formatShortTime } from "../../../utils";
import { AssetsTransactionsProps } from "./AssetsTransactions.types";

interface AssetTransactionItemProps {
  key: number;
  asset?: CryptoAssetsProps;
  transaction?: CryptoTransactionsProps;
}

const AssetItem = ({ asset }: AssetTransactionItemProps) => {
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

const TransactionItem = ({ transaction }: AssetTransactionItemProps) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol
            size="1.5"
            className="transaction-icon"
          >
            <div className={`icon-container ${transaction?.operation}`}>
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
            </div>
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
              {formatLongDate(`${transaction?.timestamp}`) +
                " | " +
                formatShortTime(`${transaction?.timestamp}`)}
            </IonLabel>
          </IonCol>
          <IonCol
            size="4"
            className="transaction-amount"
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

const TransactionFilters = () => {
  return (
    <div className="transactions-filters">
      <IonButton color="medium-grey">
        <IonIcon
          slot="icon-only"
          icon={cashOutline}
          color="secondary"
          className="filter-icon"
        />
        <IonLabel color="secondary">
          {i18n.t("crypto.tab.assetstransactions.assets")}
        </IonLabel>
      </IonButton>
      <IonButton color="medium-grey">
        <IonIcon
          slot="icon-only"
          icon={imageOutline}
          color="secondary"
          className="filter-icon"
        />
        <IonLabel color="secondary">
          {i18n.t("crypto.tab.assetstransactions.nfts")}
        </IonLabel>
      </IonButton>
      <IonButton color="medium-grey">
        <IonIcon
          slot="icon-only"
          icon={codeSlashOutline}
          color="secondary"
          className="filter-icon"
        />
        <IonLabel color="secondary">
          {i18n.t("crypto.tab.assetstransactions.metadata")}
        </IonLabel>
      </IonButton>
    </div>
  );
};

const AssetsTransactions = ({
  assets,
  transactions,
  expanded,
  hideBalance,
}: AssetsTransactionsProps) => {
  const [selectedTab, setSelectedTab] = useState("assets");
  useEffect(() => {
    if (!expanded) {
      setSelectedTab("assets");
    }
  }, [expanded]);
  return (
    <div
      className={`assets-transactions modal ${
        hideBalance ? "hide-balance" : "show-balance"
      }`}
    >
      {expanded ? (
        <IonGrid
          className={`assets-transactions-header ${
            expanded ? "expanded" : "compact"
          } ${selectedTab === "transactions" ? "transactions" : "assets"}`}
        >
          <IonRow>
            <IonCol size="12">
              <IonSegment
                className="assets-transactions-toggle-segment"
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
              {selectedTab === "transactions" ? (
                <>
                  <IonSearchbar
                    placeholder={`${i18n.t(
                      "crypto.tab.assetstransactions.searchtransactions"
                    )}`}
                    data-testid="assets-transactions-searchbar"
                  />
                  <TransactionFilters />
                </>
              ) : null}
            </IonCol>
          </IonRow>
        </IonGrid>
      ) : null}
      <PageLayout>
        <IonGrid className={expanded ? "expanded" : "compact"}>
          {expanded ? (
            <IonRow>
              <IonCol size="12">
                {selectedTab === "assets" && assets.length ? (
                  <IonList
                    lines="none"
                    className="assets-list"
                    data-testid="assets-list"
                  >
                    {assets.map((asset, index) => {
                      return (
                        <AssetItem
                          key={index}
                          asset={asset}
                        />
                      );
                    })}
                  </IonList>
                ) : null}
                {selectedTab === "transactions" && transactions.length ? (
                  <IonList
                    lines="none"
                    className="transactions-list"
                    data-testid="transactions-list"
                  >
                    {transactions.map((transaction, index) => {
                      return (
                        <TransactionItem
                          key={index}
                          transaction={transaction}
                        />
                      );
                    })}
                  </IonList>
                ) : null}
              </IonCol>
            </IonRow>
          ) : (
            <>
              <IonRow>
                <IonCol size="12">
                  <IonLabel className="assets-transactions-swipe-message">
                    {i18n.t("crypto.tab.assetstransactions.swipeupmessage")}
                  </IonLabel>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="12">
                  {assets.length ? (
                    <IonList
                      lines="none"
                      className="assets-list"
                    >
                      <AssetItem
                        key={0}
                        asset={assets[0]}
                      />
                    </IonList>
                  ) : null}
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </PageLayout>
    </div>
  );
};

export { AssetsTransactions };
