import { useEffect, useState } from "react";
import { arrowBackOutline } from "ionicons/icons";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import "./Settings.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";

const Settings = () => {
  const pageId = "settings";
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    currentOperation === OperationType.SHOW_SETTINGS && setShowSettings(true);
  }, []);

  return (
    <ScrollablePageLayout
      pageId={pageId}
      activeStatus={showSettings}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={() => {
            setShowSettings(false);
            dispatch(setCurrentOperation(OperationType.IDLE));
          }}
          closeButtonIcon={arrowBackOutline}
        />
      }
      customClass={`${showSettings ? "show" : "hide"}`}
    >
      <div className={`${pageId}-content`}>Page content</div>
    </ScrollablePageLayout>
  );
};

export { Settings };
