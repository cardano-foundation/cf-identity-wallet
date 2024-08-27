import { IonCheckbox, IonIcon, IonSpinner } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Agent } from "../../../../../core/agent/agent";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { CardItem, CardList } from "../../../../components/CardList";
import { CredentialDetailModal } from "../../../../components/CredentialDetailModule";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { Verification } from "../../../../components/Verification";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { ToastMsgType } from "../../../../globals/types";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import "./ChooseCredential.scss";
import {
  ChooseCredentialProps,
  LightCredentialDetailModalProps,
  RequestCredential,
} from "./CredentialRequest.types";
import { BackReason } from "../../../../components/CredentialDetailModule/CredentialDetailModule.types";

const CRED_EMPTY = "Credential is empty";

const LightCredentialDetailModal = ({
  credId,
  isOpen,
  defaultSelected,
  setIsOpen,
  onClose,
}: LightCredentialDetailModalProps) => {
  const [isSelected, setSelected] = useState(defaultSelected);

  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  return (
    <CredentialDetailModal
      pageId="request-cred-detail"
      id={credId || ""}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={(reason) => {
        onClose(reason, isSelected, credId);
      }}
      isLightMode
      selected={isSelected}
      setSelected={setSelected}
    />
  );
};

const ChooseCredential = ({
  pageId,
  activeStatus,
  credentialRequest,
  notificationDetails,
  onBack,
  onClose,
  reloadData,
}: ChooseCredentialProps) => {
  const connections = useAppSelector(getConnectionsCache);
  const notifications = useAppSelector(getNotificationsCache);
  const dispatch = useDispatch();
  const [selectedCred, setSelectedCred] = useState<RequestCredential | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [viewCredDetail, setViewCredDetail] =
    useState<RequestCredential | null>(null);

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

  const handleSelectCredOnModal = (reason: BackReason, selected: boolean) => {
    if (reason === BackReason.ARCHIVED) {
      reloadData();
      return;
    }

    const isShowSelectedCred = viewCredDetail?.acdc.d === selectedCred?.acdc.d;

    if (selected && !isShowSelectedCred) {
      setSelectedCred(viewCredDetail);
    }

    if (!selected && isShowSelectedCred) {
      setSelectedCred(null);
    }

    setViewCredDetail(null);
  };

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
      onClose();
    } catch (e) {
      dispatch(setToastMsg(ToastMsgType.SHARE_CRED_FAIL));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
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
            primaryButtonAction={() => setVerifyIsOpen(true)}
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
                  setViewCredDetail(data);
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleRequestCredential}
      />
      <LightCredentialDetailModal
        defaultSelected={viewCredDetail?.acdc.d === selectedCred?.acdc.d}
        credId={viewCredDetail?.acdc.d || ""}
        isOpen={!!viewCredDetail}
        setIsOpen={() => setViewCredDetail(null)}
        onClose={handleSelectCredOnModal}
      />
    </>
  );
};

export { ChooseCredential };
