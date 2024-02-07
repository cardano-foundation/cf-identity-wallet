import { useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Crypto.scss";
import { i18n } from "../../../i18n";

const Crypto = () => {
  const pageId = "crypto-tab";
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }));
  });

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      menuButton={true}
    >
      <div className="crypto-tab-content">
        <h2>{i18n.t("crypto.tab.header")}</h2>
      </div>
    </TabLayout>
  );
};

export { Crypto };
