import { IonIcon, IonText } from "@ionic/react";
import {
  chevronDownOutline,
  chevronUpOutline,
  keyOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "i18next";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
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
import "./RemoteSignRequest.scss";

function ellipsisText(text: string) {
  return `${text.substring(0, 8)}...${text.slice(-8)}`;
}

const RemoteSignRequest = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const connections = useAppSelector(getConnectionsCache);
  const [isSigningObject, setIsSigningObject] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [isExpand, setExpand] = useState(false);
  const [displayExpandButton, setDisplayExpandButton] = useState(false);
  const attributeContainerRef = useRef<HTMLDivElement>(null);
  const attributeRef = useRef<HTMLDivElement>(null);
  const requestData = notificationDetails.a.payload as Record<string, string>;
  const connectionName = connections[notificationDetails.connectionId];

  const signDetails = useMemo(() => {
    if (!requestData?.payload) {
      return {};
    }

    let signContent;
    try {
      signContent = JSON.parse(requestData.payload);

      signContent["id"] = ellipsisText(signContent["id"]);
      signContent["address"] = ellipsisText(signContent["address"]);

      setIsSigningObject(true);
    } catch (error) {
      signContent = requestData.payload;
    }
    return signContent;
  }, [requestData]);

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
    setExpand((value) => !value);
  };

  const signContentCss = combineClassNames("sign-data", {
    expand: isExpand,
  });

  useEffect(() => {
    // NOTE: Check attribute section height to show expand/collapse button
    if (!attributeRef.current || !attributeContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!attributeRef.current || !attributeContainerRef.current) return;

      const height = attributeRef.current.clientHeight;

      if (height < 1) return;

      const minCollapseHeight = 80; // 5rem

      // NOTE: If attribute section height greater than min height => show button
      setDisplayExpandButton(minCollapseHeight < height);
      attributeContainerRef.current.style.height =
        minCollapseHeight > height ? "auto" : "5rem";

      resizeObserver.disconnect();
    });

    resizeObserver.observe(attributeRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    function calcHeight() {
      if (!attributeRef.current || !attributeContainerRef.current) return;

      const height = attributeRef.current.clientHeight;
      const minCollapseHeight = 80; // 5rem

      if (isExpand) {
        attributeContainerRef.current.style.height = `${height}px`;
      } else {
        attributeContainerRef.current.style.height =
          minCollapseHeight > height ? "auto" : "5rem";
      }
    }

    calcHeight();
  }, [isExpand, signDetails]);

  return (
    <>
      <ScrollablePageLayout
        activeStatus={activeStatus}
        pageId={pageId}
        customClass="custom-sign-request"
        header={
          <PageHeader
            onBack={handleBack}
            title={`${t("tabs.notifications.details.sign.title", {
              certificate: "CSO Certificate", // TODO: change hardcoded value to dynamic
            })}`}
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
          <div className="sign-owner-logo">
            <IonIcon
              data-testid="sign-logo"
              icon={personCircleOutline}
              color="light"
            />
          </div>
          <h2 className="sign-name">{connectionName?.label}</h2>
        </div>
        <h3 className="sign-info">
          {i18n.t("tabs.notifications.details.sign.info")}
        </h3>
        <div className="sign-content">
          <CardBlock
            title={`${i18n.t("tabs.notifications.details.sign.identifier")}`}
            testId="identifier-id-block"
            className="sign-identifier"
          >
            <CardDetailsItem
              info={ellipsisText(requestData.identifier || "")}
              icon={keyOutline}
              testId="identifier-id"
              className="identifier-id"
              mask={false}
              copyButton
            />
          </CardBlock>
          <CardBlock
            title={i18n.t("tabs.notifications.details.sign.transaction.data")}
            className={signContentCss}
            testId="sign-data"
          >
            <div
              ref={attributeContainerRef}
              className="content-container"
            >
              <div
                ref={attributeRef}
                className="content"
              >
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
            {displayExpandButton && (
              <div
                className="footer"
                onClick={onExpandData}
              >
                <IonIcon
                  className="expand"
                  icon={isExpand ? chevronUpOutline : chevronDownOutline}
                />
              </div>
            )}
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

export { RemoteSignRequest };
