import { IonCard, IonIcon, IonModal } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../../../i18n";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { DetailView, IdentifierDetailModalProps } from "./IdentifierDetailModal.types";
import { IdentifierIDDetail } from "./IndetifierIDDetail";
import "./IdentifierDetailModal.scss";
import { SigningThreshold } from "./SigningThreshold";
import { CreatedTimestamp } from "./CreatedTimestamp";
import { SenquenceNumber } from "./SenquenceNumber";
import { RotationThreshold } from "./RotationThreshold";
import { List } from "./List";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { getMultisigConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import { getAuthentication, setToastMsg } from "../../../../../store/reducers/stateCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { Verification } from "../../../../components/Verification";
import { Agent } from "../../../../../core/agent/agent";
import { ToastMsgType } from "../../../../globals/types";
import { Spinner } from "../../../../components/Spinner";
import { showError } from "../../../../utils/error";
import { getDismissIdentifierPropExplain, setDismissIdentifierPropExplain } from "../../../../../store/reducers/identifiersCache";
import { Alert } from "../../../../components/Alert";
import { BasicRecord } from "../../../../../core/agent/records";
import { MiscRecordId } from "../../../../../core/agent/agent.types";

const IdentifierDetailModal = ({ isOpen, setOpen, view, data, setViewType, reloadData }: IdentifierDetailModalProps) => {
  const dispatch = useAppDispatch();
  const propExplainDismiss = useAppSelector(getDismissIdentifierPropExplain);
  const userName = useAppSelector(getAuthentication)?.userName;
  const multisignConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const isDismiss = propExplainDismiss?.includes(view);
  const isMultisig = data.multisigManageAid || data.groupMetadata;

  const handleRotateKey = () => {
    setVerifyIsOpen(true);
  };

  const handleAfterVerify = async () => {
    setLoading(true);

    try {
      await Agent.agent.identifiers.rotateIdentifier(data.id);
      await reloadData();
      handleClose();
      dispatch(setToastMsg(ToastMsgType.ROTATE_KEY_SUCCESS));
    } catch (e) {
      showError("Unable to rotate key", e, dispatch, ToastMsgType.ROTATE_KEY_ERROR);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setOpen(false);
  }

  const renderContent = () => {
    let memberIndex: number; 
    const members =  data.members?.map((member, index) => {
      const memberConnection = multisignConnectionsCache[member];
      let name = memberConnection?.label || member;

      if (!memberConnection?.label) {
        memberIndex = index;
        name = userName;
      }

      return {
        image: KeriLogo,
        title: name,
        isCurrentUser: !memberConnection?.label
      }
    });

    switch(view) {
    case DetailView.SigningThreshold:
      return <SigningThreshold data={data} setViewType={setViewType} />
    case DetailView.RotationThreshold:
      return <RotationThreshold data={data} setViewType={setViewType} />
    case DetailView.Created:
      return <CreatedTimestamp createdTime={data.createdAtUTC} />
    case DetailView.SequenceNumber:
      return <SenquenceNumber data={data} />
    case DetailView.GroupMember: {
      return <List 
        bottomText={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.bottomtext`, { members: members?.length || 0 })}`} 
        title={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.title`)}`} 
        data={members || []}
        mask
      />
    }
    case DetailView.RotationKeyDigests: {
      const members =  data.n?.map((key) => {
        return {
          title: key,
        }
      })

      return <List 
        bottomText={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.bottomtext`, { keys: members?.length || 0 })}`} 
        title={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.title`)}`} 
        data={members || []} 
        fullText
      />
    }
    case DetailView.SigningKey: {
      const members =  data.k?.map((key, index) => {
        return {
          title: key,
          isCurrentUser: memberIndex === index || !isMultisig
        }
      })

      return <List 
        bottomText={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.bottomtext`, { keys: members?.length || 0 })}`} 
        title={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.title`)}`} 
        data={members || []} 
        rotateAction={!isMultisig ? handleRotateKey : undefined}
        mask
      />
    }
    default:
      return <IdentifierIDDetail id={data.id}/>
    }
  }

  const dismissPropExplain = () => {
    setAlertIsOpen(false);
    dispatch(setDismissIdentifierPropExplain([view]));
  }

  const hideExplain = () => {
    const newValue = [...(propExplainDismiss || []), view];
    dismissPropExplain();
    Agent.agent.basicStorage
      .createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.DISMISS_PROP_EXPLAIN,
          content: {
            value: newValue,
          },
        })
      )
      .catch((e) => {
        showError("Unable to dismiss prop explain", e, dispatch);
      });
  }

  return (
    <>
      <IonModal
        isOpen={isOpen}
        className="identifier-detail-modal"
        data-testid="identifier-detail-modal"
      >
        <ScrollablePageLayout
          pageId={view} 
          header={
            <PageHeader
              title={`${i18n.t(`tabs.identifiers.details.detailmodal.${view}.title`)}`}
              closeButton
              closeButtonLabel={`${i18n.t("tabs.identifiers.details.detailmodal.button.done")}`}
              closeButtonAction={handleClose}
            />}
        >
          {!isDismiss && (<><div className="prop-explain">
            <h3>{i18n.t(`tabs.identifiers.details.detailmodal.${view}.propexplain.title`)}</h3>
            <p data-testid="dissmiss-button" onClick={() => setAlertIsOpen(true)}>{i18n.t("tabs.identifiers.details.detailmodal.button.dismiss")}</p>
          </div>
          <IonCard className="prop-explain-content">
            <p>{i18n.t(`tabs.identifiers.details.detailmodal.${view}.propexplain.content`)}</p>
            <div className="alert-icon">
              <IonIcon
                icon={informationCircleOutline}
                slot="icon-only"
              />
            </div>
          </IonCard></>)}
          {renderContent()}
          <Spinner show={loading} />
        </ScrollablePageLayout>
      </IonModal>
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleAfterVerify}
      />
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="dismiss-prop-explain"
        headerText={i18n.t("tabs.identifiers.details.detailmodal.dismissalert.text")}
        confirmButtonText={`${i18n.t(
          "tabs.identifiers.details.detailmodal.dismissalert.accept"
        )}`}
        secondaryConfirmButtonText={`${i18n.t(
          "tabs.identifiers.details.detailmodal.dismissalert.cancel"
        )}`}
        actionConfirm={hideExplain}
        actionSecondaryConfirm={dismissPropExplain}
        actionDismiss={() => setAlertIsOpen(false)}
      />
    </>
  )
}

export { IdentifierDetailModal };
