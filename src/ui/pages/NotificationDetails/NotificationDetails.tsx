import { ellipsisVertical } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
} from "@ionic/react";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import "./NotificationDetails.scss";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert as AlertDeleteNotification } from "../../components/Alert";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../store/reducers/notificationsCache";
import { VerifyPasscode } from "../../components/VerifyPasscode";
import { OperationType, ToastMsgType } from "../../globals/types";
import { NotificationDetailsHeader } from "./components/NotificationDetailsHeader";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { CardDetailsBlock } from "../../components/CardDetails";
import { useAppIonRouter } from "../../hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { KeriaNotification } from "../../../core/agent/agent.types";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const notificationsData = useAppSelector(getNotificationsCache);
  const [notificationDetails, setNotificationDetails] =
    useState<KeriaNotification>(history?.location?.state as KeriaNotification);
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertDeleteNotificationIsOpen, setAlertDeleteNotificationIsOpen] =
    useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("details");
  const [loading, setLoading] = useState({
    details: false,
    history: false,
  });

  const getDetails = async () => {
    // try {
    //   const notificationDetails =
    //     await Agent.agent.notifications.getNotificationById(
    //       notificationDetails.id
    //     );
    //   setNotificationDetails(notificationDetails);
    //   if (notificationDetails.notes) {
    //     setNotes(notificationDetails.notes);
    //   }
    // } catch (e) {
    //   // @TODO - Error handling.
    // } finally {
    //   setLoading((value) => ({ ...value, details: false }));
    // }
  };

  // useEffect(() => {
  //   if (notificationDetails?.id) {
  //     setLoading({
  //       history: true,
  //       details: true,
  //     });
  //     getDetails();
  //   }
  // }, [notificationDetails?.id]);

  const handleDone = () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.NOTIFICATION_DETAILS,
      data
    );

    updateReduxState(backPath.pathname, data, dispatch, updateRedux);
    ionicRouter.goBack();
  };

  const handleDelete = () => {
    setOptionsIsOpen(false);
    setAlertDeleteNotificationIsOpen(true);
  };

  const verifyAction = () => {
    async function deleteNotification() {
      // await Agent.agent.notifications.deleteNotificationById(
      //   notificationDetails.id
      // );
      const updatedNotifications = notificationsData.filter(
        (item) => item.id !== notificationDetails?.id
      );
      // dispatch(setToastMsg(ToastMsgType.NOTIFICATION_DELETED));
      dispatch(setNotificationsCache(updatedNotifications));
      handleDone();
      setVerifyPasswordIsOpen(false);
      setVerifyPasscodeIsOpen(false);
    }
    deleteNotification();
  };

  // if (loading.details || loading.history) {
  //   return (
  //     <div
  //       className="notification-detail-spinner-container"
  //       data-testid="notification-detail-spinner-container"
  //     >
  //       <IonSpinner name="circular" />
  //     </div>
  //   );
  // }

  const deleteButtonAction = () => {
    setAlertDeleteNotificationIsOpen(true);
    // dispatch(setCurrentOperation(OperationType.DELETE_NOTIFICATION));
  };

  const handleAuthentication = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        customClass="item-details-page"
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleDone}
            closeButtonLabel={`${i18n.t("notifications.details.done")}`}
            currentPath={RoutePath.NOTIFICATION_DETAILS}
            actionButton={true}
            actionButtonAction={() => setOptionsIsOpen(true)}
            actionButtonIcon={ellipsisVertical}
          />
        }
      >
        <div className="notification-details-content">
          <NotificationDetailsHeader
            logo={KeriLogo}
            label={""}
            date={""}
          />
          <div
            className="notification-details-tab"
            data-testid="notification-details-tab"
          >
            <>Details</>
            <PageFooter
              pageId={pageId}
              deleteButtonText={`${i18n.t("notifications.details.delete")}`}
              deleteButtonAction={() => deleteButtonAction()}
            />
          </div>
        </div>
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={verifyAction}
        />
        <VerifyPasscode
          isOpen={verifyPasscodeIsOpen}
          setIsOpen={setVerifyPasscodeIsOpen}
          onVerify={verifyAction}
        />
      </ScrollablePageLayout>
      <AlertDeleteNotification
        isOpen={alertDeleteNotificationIsOpen}
        setIsOpen={setAlertDeleteNotificationIsOpen}
        dataTestId="alert-confirm-delete-notification"
        headerText={i18n.t(
          "notifications.details.options.alert.deletenotification.title"
        )}
        confirmButtonText={`${i18n.t(
          "notifications.details.options.alert.deletenotification.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "notifications.details.options.alert.deletenotification.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
    </>
  );
};

export { NotificationDetails };
