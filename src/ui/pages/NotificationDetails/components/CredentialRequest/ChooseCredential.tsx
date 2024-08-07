import { IonCheckbox, IonIcon, IonSpinner } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../../../i18n";
import { TabsRoutePath } from "../../../../../routes/paths";
import { useAppSelector } from "../../../../../store/hooks";
import {
  getNotificationDetailCache,
  getNotificationsCache,
  setNotificationsCache,
  setNotificationDetailCache,
} from "../../../../../store/reducers/notificationsCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { CardItem, CardList } from "../../../../components/CardList";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { NotificationDetailState } from "../../NotificationDetails.types";
import "./ChooseCredential.scss";
import {
  ChooseCredentialProps,
  RequestCredential,
} from "./CredentialRequest.types";
import { Agent } from "../../../../../core/agent/agent";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../../globals/types";

const CRED_EMPTY = "Credential is empty";

const ChooseCredential = ({
  pageId,
  activeStatus,
  credentialRequest,
  notificationDetails,
  onBack,
  onClose,
}: ChooseCredentialProps) => {
  const history = useHistory<NotificationDetailState>();
  const connections = useAppSelector(getConnectionsCache);
  const notifications = useAppSelector(getNotificationsCache);
  const notificationDetailCache = useAppSelector(getNotificationDetailCache);
  const dispatch = useDispatch();
  const [selectedCred, setSelectedCred] = useState<RequestCredential | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const displayIdentifiers = credentialRequest.credentials.map(
    (cred): CardItem<RequestCredential> => {
      const connection = connections?.[cred.connectionId]?.label || "";

      return {
        id: cred.acdc.d,
        title: connection,
        subtitle: `${formatShortDate(cred.acdc.a.dt)} - ${formatTimeToSec(
          cred.acdc.a.dt
        )}`,
        image: KeriLogo,
        data: cred,
      };
    }
  );

  const handleSelectCred = useCallback((data: RequestCredential) => {
    setSelectedCred((selectedCred) =>
      selectedCred?.acdc.d === data.acdc.d ? null : data
    );
  }, []);

  useEffect(() => {
    if (
      !notificationDetailCache ||
      !history.location.pathname.includes(TabsRoutePath.NOTIFICATIONS)
    ) {
      return;
    }

    if (notificationDetailCache.checked) {
      const updatedCred = credentialRequest.credentials.find(
        (cred) => cred.acdc.d === notificationDetailCache.viewCred
      );

      if (updatedCred) {
        setSelectedCred(updatedCred as RequestCredential);
      }
    } else if (selectedCred?.acdc.d === notificationDetailCache.viewCred) {
      setSelectedCred(null);
    }

    dispatch(setNotificationDetailCache(null));
  }, [
    credentialRequest.credentials,
    dispatch,
    handleSelectCred,
    history.location.pathname,
    notificationDetailCache,
    selectedCred,
  ]);

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );

    dispatch(setNotificationsCache(updatedNotifications));
  };

  const handleRequestCredential = async () => {
    try {
      if (!selectedCred) {
        throw Error(CRED_EMPTY);
      }

      setLoading(true);
      await Agent.agent.ipexCommunications.offerAcdcFromApply(
        notificationDetails,
        selectedCred.acdc
      );
      handleNotificationUpdate();
      dispatch(setToastMsg(ToastMsgType.SHARE_CRED_SUCCESS));
      dispatch(setNotificationDetailCache(null));
      onClose();
    } catch (e) {
      dispatch(setToastMsg(ToastMsgType.SHARE_CRED_FAIL));
    } finally {
      setLoading(false);
    }
  };

  const showCredDetail = (data: RequestCredential) => {
    const pathname = `${TabsRoutePath.CREDENTIALS}/metadata:${data.acdc.d}`;
    dispatch(
      setNotificationDetailCache({
        notificationId: notificationDetails.id,
        viewCred: data.acdc.d,
        step: 1,
        checked: selectedCred?.acdc.d === data.acdc.d,
      })
    );
    history.push(pathname);
  };

  const handleBack = () => {
    onBack();
    dispatch(setNotificationDetailCache(null));
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={`${pageId}-credential-choose`}
        activeStatus={activeStatus}
        customClass="choose-credential"
        header={
          <PageHeader
            title={`${i18n.t(
              "notifications.details.credential.request.choosecredential.title"
            )}`}
            closeButton
            closeButtonLabel={`${i18n.t("notifications.details.buttons.back")}`}
            closeButtonAction={handleBack}
            hardwareBackButtonConfig={{
              prevent: !activeStatus,
            }}
          />
        }
        footer={
          <PageFooter
            pageId={pageId}
            customClass="credential-request-footer"
            primaryButtonText={`${i18n.t(
              "notifications.details.buttons.providecredential"
            )}`}
            primaryButtonAction={handleRequestCredential}
            primaryButtonDisabled={!selectedCred}
          />
        }
      >
        <h2 className="title">
          {i18n.t(
            "notifications.details.credential.request.choosecredential.description",
            {
              requestCred: credentialRequest.schema.name,
            }
          )}
        </h2>
        <CardList
          data={displayIdentifiers}
          onCardClick={(data, e) => {
            e.stopPropagation();
          }}
          onRenderStartSlot={(data) => {
            return (
              <IonIcon
                className="info-icon"
                icon={informationCircleOutline}
                data-testid={`cred-detail-${data.acdc.d}`}
                onClick={(e) => {
                  e.stopPropagation();
                  showCredDetail(data);
                }}
              />
            );
          }}
          onRenderEndSlot={(data) => {
            return (
              <IonCheckbox
                checked={selectedCred?.acdc?.d === data.acdc.d}
                aria-label=""
                className="checkbox"
                data-testid={`cred-select-${data.acdc.d}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCred(data);
                }}
              />
            );
          }}
        />
      </ScrollablePageLayout>
      {loading && (
        <div
          className="cre-request-spinner-container"
          data-testid="cre-request-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
    </>
  );
};

export { ChooseCredential };
