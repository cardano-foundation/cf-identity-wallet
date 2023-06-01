import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { shareOutline, ellipsisVertical } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { i18n } from "../../../i18n";
import { CardsStack } from "../../components/CardsStack";
import { RootState } from "../../../store";
import { clearCardInfoCache } from "../../../store/reducers/cardInfoCache";
import "./CardDetails.scss";

const OtherButtons = () => {
  return (
    <>
      <IonButton
        shape="round"
        className="contacts-button"
        data-testid="contacts-button"
      >
        <IonIcon
          slot="icon-only"
          icon={shareOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
      >
        <IonIcon
          slot="icon-only"
          icon={ellipsisVertical}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const CardDetails = () => {
  const history = useHistory();
  const cardProps = useSelector(
    (state: RootState) => state.cardInfoCache.cardProps
  );
  const cardData = useSelector(
    (state: RootState) => state.cardInfoCache.cardData
  );
  const path = TabsRoutePath.DIDS;

  return (
    <IonPage className="tab-layout card-details">
      <TabLayout
        header={true}
        title={`${i18n.t("carddetails.done")}`}
        titleSize="h3"
        titleAction={() => {
          clearCardInfoCache();
          history.replace(path);
        }}
        menuButton={false}
        otherButtons={<OtherButtons />}
      >
        <CardsStack
          cardsType={cardProps.cardType}
          cardsData={cardData}
        />
      </TabLayout>
    </IonPage>
  );
};

export { CardDetails, OtherButtons };
