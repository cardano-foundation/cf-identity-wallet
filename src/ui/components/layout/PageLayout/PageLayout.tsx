import { IonHeader, IonContent, IonFooter } from "@ionic/react";
import "./PageLayout.scss";
import { PageLayoutProps } from "./PageLayout.types";
import PageFooter from "../../PageFooter/PageFooter";
import { PageHeader } from "../../PageHeader";

const PageLayout = ({
  id,
  header,
  backButton,
  beforeBack,
  onBack,
  currentPath,
  children,
  closeButton,
  closeButtonAction,
  closeButtonLabel,
  actionButton,
  actionButtonDisabled,
  actionButtonAction,
  actionButtonLabel,
  actionButtonIcon,
  progressBar,
  progressBarValue,
  progressBarBuffer,
  title,
  menuButton,
  footer,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
  secondaryButtonText,
  secondaryButtonAction,
}: PageLayoutProps) => {
  return (
    <>
      {header && (
        <IonHeader
          translucent={true}
          className="ion-no-border page-header"
        >
          <PageHeader
            backButton={backButton}
            beforeBack={beforeBack}
            onBack={onBack}
            currentPath={currentPath}
            closeButton={closeButton}
            closeButtonAction={closeButtonAction}
            closeButtonLabel={closeButtonLabel}
            actionButton={actionButton}
            actionButtonDisabled={actionButtonDisabled}
            actionButtonAction={actionButtonAction}
            actionButtonLabel={actionButtonLabel}
            actionButtonIcon={actionButtonIcon}
            progressBar={progressBar}
            progressBarValue={progressBarValue}
            progressBarBuffer={progressBarBuffer}
            title={title}
            menuButton={menuButton}
          />
        </IonHeader>
      )}

      <IonContent>{children}</IonContent>

      {footer && (
        <IonFooter
          collapse="fade"
          className="ion-no-border"
        >
          <PageFooter
            pageId={id}
            primaryButtonText={primaryButtonText}
            primaryButtonAction={primaryButtonAction}
            primaryButtonDisabled={primaryButtonDisabled}
            secondaryButtonText={secondaryButtonText}
            secondaryButtonAction={secondaryButtonAction}
          />
        </IonFooter>
      )}
    </>
  );
};

export { PageLayout };
