import { IonSpinner } from "@ionic/react";
import { i18n } from "../../../i18n";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import "./AppOffline.scss";
import { useExitAppWithDoubleTap } from "../../hooks/exitAppWithDoubleTapHook";
import { BackEventPriorityType } from "../../globals/types";
import { useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getIsOnline,
} from "../../../store/reducers/stateCache";

const AppOfflinePage = () => {
  const loggedIn = useAppSelector(getAuthentication).loggedIn;

  // NOTE: Prevent all registered hardware back button of other pages instead of lock page.
  useExitAppWithDoubleTap(!loggedIn, BackEventPriorityType.LockPage);

  return (
    <ResponsivePageLayout
      activeStatus
      pageId="offline"
      customClass="offline-page"
    >
      <div className="page-content-container">
        <div className="page-content">
          <h1>{i18n.t("offline.title")}</h1>
          <p>{i18n.t("offline.description")}</p>
        </div>
        <IonSpinner name="circular" />
      </div>
    </ResponsivePageLayout>
  );
};

const AppOffline = () => {
  const ssiAgentIsSet = useAppSelector(getAuthentication).ssiAgentIsSet;
  const isOnline = useAppSelector(getIsOnline);

  if (!ssiAgentIsSet || isOnline) return null;

  return <AppOfflinePage />;
};

export { AppOffline };
