import { IonModal } from "@ionic/react"
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout"
import { PageHeader } from "../PageHeader"
import { i18n } from "../../../i18n"
import { InfoCard } from "../InfoCard"

const MissingIssuerModal = ({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: (value: boolean) => void} ) => {
  const testId = "missing-issuer";

  const onClose = () => {
    setIsOpen(false);
  }

  return (
    <IonModal 
      isOpen={isOpen}
      data-testid={`${testId}-modal`}
    >
      <ResponsivePageLayout
        pageId={testId}
        header={
          <PageHeader 
            closeButton 
            closeButtonAction={onClose} 
            closeButtonLabel={`${i18n.t("missingissuer.done")}`} 
          />
        }
      >
        <InfoCard content={i18n.t("missingissuer.content")} />
      </ResponsivePageLayout>
    </IonModal>
  )
}

export { MissingIssuerModal };