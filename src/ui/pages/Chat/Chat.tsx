import { Trans } from "react-i18next";
import { useState } from "react";
import {
  IonCol,
  IonGrid,
  IonModal,
  IonPage,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Chat.scss";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";

const Chat = () => {
  const dispatch = useAppDispatch();
  const [featuresModalIsOpen, setFeaturesModalIsOpen] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CHAT }));
  });

  const HandleFeatures = () => {
    return (
      <a onClick={() => setFeaturesModalIsOpen(true)}>
        <u>{i18n.t("chat.tab.action.link")}</u>
      </a>
    );
  };

  const features: string[] = i18n.t("chat.modal.features", {
    returnObjects: true,
  });

  return (
    <>
      <IonPage
        className="tab-layout"
        data-testid="chat-tab"
      >
        <TabLayout
          header={true}
          menuButton={true}
        >
          <div className="chat-tab-content">
            <h2>{i18n.t("chat.tab.header")}</h2>
            <Trans
              i18nKey={i18n.t("chat.tab.action.text")}
              components={[<HandleFeatures key="" />]}
            />
          </div>
        </TabLayout>
      </IonPage>
      <IonModal
        isOpen={featuresModalIsOpen}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        className="page-layout"
        data-testid="chat-modal"
        onDidDismiss={() => setFeaturesModalIsOpen(false)}
      >
        <div className="chat-modal modal">
          <PageLayout
            header={true}
            closeButton={true}
            closeButtonLabel={`${i18n.t("chat.modal.done")}`}
            closeButtonAction={() => setFeaturesModalIsOpen(false)}
            title={`${i18n.t("chat.modal.title")}`}
          >
            <IonGrid>
              <IonRow>
                <IonCol
                  size="12"
                  className="chat-modal-body"
                >
                  <ol>
                    {features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ol>
                </IonCol>
              </IonRow>
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    </>
  );
};

export { Chat };
