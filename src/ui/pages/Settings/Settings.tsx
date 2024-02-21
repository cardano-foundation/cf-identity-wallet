import { arrowBackOutline } from "ionicons/icons";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import "./Settings.scss";
import { SettingsProps } from "./Settings.types";

const Settings = ({ showSettings, setShowSettings }: SettingsProps) => {
  const pageId = "settings";

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={() => setShowSettings(false)}
          closeButtonIcon={arrowBackOutline}
        />
      }
      customClass={showSettings ? "show" : "hide"}
    >
      <div className={`${pageId}-content`}></div>
    </ScrollablePageLayout>
  );
};

export { Settings };
