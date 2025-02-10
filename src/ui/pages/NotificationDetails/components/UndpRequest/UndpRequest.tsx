import { IonIcon, IonText } from "@ionic/react";
import { chevronDownOutline, chevronUpOutline, keyOutline } from "ionicons/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import UserIcon from "../../../../assets/images/undp-logo.png";
import {
  CardBlock,
  CardDetailsAttributes,
  CardDetailsItem,
} from "../../../../components/CardDetails";
import { reservedKeysFilter } from "../../../../components/CardDetails/CardDetailsAttributes/CardDetailsAttributes.utils";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { Verification } from "../../../../components/Verification";
import { combineClassNames } from "../../../../utils/style";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import { UndpSignRequest } from "./Undp.types";
import "./UndpRequest.scss";
import { signUNDPObjectFix } from "../../../../__fixtures__/notificationsFix";

function ellipsisText(text: string) {
  return `${text.substring(0, 8)}...${text.slice(-8)}`;
}

const UndpRequest = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const connections = useAppSelector(getConnectionsCache);
  const [isSigningObject, setIsSigningObject] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [requestData, ] = useState<UndpSignRequest>({
    signTransaction: signUNDPObjectFix,
  });
  const [isExpand, setExpand] = useState(false);
  const [displayExpandButton, setDisplayExpandButton] = useState(false);

  const attributeContainerRef = useRef<HTMLDivElement>(null);
  const attributeRef = useRef<HTMLDivElement>(null);

  const connectionName = connections[notificationDetails.connectionId];
  const signTransaction = requestData.signTransaction;
  const logo = UserIcon;

  const signDetails = useMemo(() => {
    if (!requestData.signTransaction) {
      return {};
    }

    let signContent;
    try {
      signContent = JSON.parse(
        requestData.signTransaction.payload.payload
      );

      signContent["id"] = ellipsisText(signContent["id"]);
      signContent["address"] = ellipsisText(signContent["address"]);
      
      setIsSigningObject(true);
    } catch (error) {
      signContent = requestData.signTransaction.payload.payload;
    }
    return signContent;
  }, [requestData.signTransaction]);

  const handleSign = () => {
    handleBack();
  };

  const itemProps = useCallback((key?: string) => {
    return {
      copyButton: ["id", "address"].includes(key || ""),
      className: "sign-info-item",
      keyValue: `${reservedKeysFilter(key || "")}:`,
    };
  }, []);

  const onExpandData = () => {
    setExpand(value => !value);
  }

  const signContentCss = combineClassNames("sign-data", {
    expand: isExpand
  })

  useEffect(() => {
    // NOTE: Check attribute section height to show expand/collapse button
    if(!attributeRef.current || !attributeContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if(!attributeRef.current || !attributeContainerRef.current) return;
  
      const height = attributeRef.current.clientHeight;

      if(height < 1) return;

      const minCollapseHeight = 80; // 5rem 

      // NOTE: If attribute section height greater than min height => show button
      setDisplayExpandButton(minCollapseHeight < height)
      attributeContainerRef.current.style.height = minCollapseHeight > height ? "auto" : "5rem";

      resizeObserver.disconnect();
    });
    
    resizeObserver.observe(attributeRef.current);

    return () => {
      resizeObserver.disconnect();
    }
  }, [])

  useEffect(() => {
    function calcHeight() {
      if(!attributeRef.current || !attributeContainerRef.current) return;
  
      const height = attributeRef.current.clientHeight;
      const minCollapseHeight = 80; // 5rem 

      if(isExpand) {
        attributeContainerRef.current.style.height = `${height}px`;
      } else {
        attributeContainerRef.current.style.height = minCollapseHeight > height ? "auto" : "5rem";
      }
    }

    calcHeight();
  }, [isExpand, signDetails]);

  return (
    <>
      <ScrollablePageLayout
        activeStatus={activeStatus}
        pageId={pageId}
        customClass="undp-request"
        header={
          <PageHeader
            onBack={handleBack}
            title={`${i18n.t("tabs.notifications.details.undp.title")}`}
          />
        }
        footer={
          <PageFooter
            customClass="sign-footer"
            primaryButtonText={`${i18n.t("request.button.sign")}`}
            primaryButtonAction={() => setVerifyIsOpen(true)}
            secondaryButtonText={`${i18n.t("request.button.dontallow")}`}
            secondaryButtonAction={handleBack}
          />
        }
      >
        <div className="sign-header">
          <img
            className="sign-owner-logo"
            data-testid="sign-logo"
            src={logo}
            alt="logo"
          />
          <h2 className="sign-name">{connectionName?.label}</h2>
        </div>
        <h3 className="sign-info">{i18n.t("tabs.notifications.details.undp.info")}</h3>
        <div className="sign-content">
          <CardBlock
            title={`${i18n.t("tabs.notifications.details.undp.identifier")}`}
            testId="identifier-id-block"
            className="sign-identifier"
          >
            <CardDetailsItem
              info={ellipsisText(signTransaction?.payload.identifier || "")}
              icon={keyOutline}
              testId="identifier-id"
              className="identifier-id"
              mask={false}
              copyButton
            />
          </CardBlock>
          <CardBlock
            title={i18n.t("tabs.notifications.details.undp.transaction.data")}
            className={signContentCss}
            testId="sign-data"
          >
            <div ref={attributeContainerRef} className="content-container">
              <div ref={attributeRef} className="content">
                {isSigningObject ? (
                  <CardDetailsAttributes
                    data={signDetails}
                    itemProps={itemProps}
                  />
                ) : (
                  <IonText className="sign-string">
                    {signDetails.toString()}
                  </IonText>
                )}
              </div>
            </div>
            {displayExpandButton && <div className="footer" onClick={onExpandData}>
              <IonIcon className="expand" icon={isExpand ? chevronUpOutline : chevronDownOutline}/>
            </div>}
          </CardBlock>
        </div>
      </ScrollablePageLayout>
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleSign}
      />
    </>
  );
};

export { UndpRequest };
