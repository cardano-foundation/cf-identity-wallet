import {
  IonCheckbox,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CredentialStatus } from "../../../../../core/agent/services/credentialService.types";
import { getCredsCache } from "../../../../../store/reducers/credsCache";
import { CardDetailsBlock } from "../../../../components/CardDetails";

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
  const credsCache = useAppSelector(getCredsCache);
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
  const [segmentValue, setSegmentValue] = useState("active");

  const mappedCredentials = credentialRequest.credentials.map(
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

  const sortedCredentials = mappedCredentials.sort(function (a, b) {
    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    const dateA = new Date(a.data.acdc.a.dt).getTime();
    const dateB = new Date(b.data.acdc.a.dt).getTime();
    return dateA - dateB;
  });

  const revokedCredsCache = useMemo(
    () => credsCache.filter((item) => item.status === CredentialStatus.REVOKED),
    [credsCache]
  );

  const revokedCredentials = sortedCredentials.filter((cred) =>
    revokedCredsCache.some((revoked) => revoked.id === cred.id)
  );

  const activeCredentials = sortedCredentials.filter(
    (cred) => !revokedCredsCache.some((revoked) => revoked.id === cred.id)
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

  const handleRequestCredential = async () => {
    try {
      if (!selectedCred) {
        throw Error(CRED_EMPTY);
      }

      setLoading(true);
      await Agent.agent.ipexCommunications.offerAcdcFromApply(
        notificationDetails.id,
        selectedCred.acdc
      );
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
              "tabs.notifications.details.credential.request.choosecredential.title"
            )}`}
            closeButton
            closeButtonLabel={`${i18n.t(
              "tabs.notifications.details.buttons.back"
            )}`}
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
              "tabs.notifications.details.buttons.providecredential"
            )}`}
            primaryButtonAction={() => setVerifyIsOpen(true)}
            primaryButtonDisabled={!selectedCred}
          />
        }
      >
        <h2 className="title">
          {i18n.t(
            "tabs.notifications.details.credential.request.choosecredential.description",
            {
              requestCred: credentialRequest.schema.name,
            }
          )}
        </h2>
        <IonSegment
          data-testid="choose-credential-segment"
          value={segmentValue}
          onIonChange={(event) => setSegmentValue(`${event.detail.value}`)}
        >
          <IonSegmentButton
            value="active"
            data-testid="choose-credential-active-button"
          >
            <IonLabel>{`${i18n.t(
              "tabs.notifications.details.credential.request.choosecredential.active"
            )}`}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton
            value="revoked"
            data-testid="choose-credential-revoked-button"
          >
            <IonLabel>{`${i18n.t(
              "tabs.notifications.details.credential.request.choosecredential.revoked"
            )}`}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        {segmentValue === "revoked" && (
          <CardDetailsBlock className="user-tips">
            <div>
              <p>
                {i18n.t(
                  "tabs.notifications.details.credential.request.choosecredential.disclaimer"
                )}
              </p>
            </div>
            <div className="disclaimer-icon">
              <IonIcon
                icon={informationCircleOutline}
                slot="icon-only"
              />
            </div>
          </CardDetailsBlock>
        )}
        {segmentValue === "active" && activeCredentials.length === 0 && (
          <h2 className="title">
            <i>
              {i18n.t(
                "tabs.notifications.details.credential.request.choosecredential.noactive",
                {
                  requestCred: credentialRequest.schema.name,
                }
              )}
            </i>
          </h2>
        )}
        {segmentValue === "revoked" && revokedCredentials.length === 0 && (
          <h2 className="title">
            <i>
              {i18n.t(
                "tabs.notifications.details.credential.request.choosecredential.norevoked",
                {
                  requestCred: credentialRequest.schema.name,
                }
              )}
            </i>
          </h2>
        )}
        <CardList
          data={
            segmentValue === "active" ? activeCredentials : revokedCredentials
          }
          onCardClick={(data, e) => {
            e.stopPropagation();
            handleSelectCred(data);
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
