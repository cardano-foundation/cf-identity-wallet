import {
  IonButton,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonToolbar,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import "./TermsAndConditions.scss";
import { TermsAndConditionsProps } from "./TermsAndConditions.types";

const TermsAndConditions = ({ isOpen, setIsOpen }: TermsAndConditionsProps) => {
  return (
    <div className="terms-and-conditions">
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75]}
        className="terms-and-conditions"
        onDidDismiss={() => setIsOpen(false)}
      >
        <IonHeader
          translucent={true}
          collapse="fade"
          className="ion-no-border"
        >
          <IonToolbar>
            <IonGrid>
              <IonRow>
                <IonCol
                  size="2"
                  className="header-column-left"
                >
                  <IonButton
                    shape="round"
                    size="small"
                    className="close-button"
                    onClick={() => setIsOpen(false)}
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={closeOutline}
                    ></IonIcon>
                  </IonButton>
                </IonCol>
                <IonCol
                  size="8"
                  className="header-column-right"
                >
                  <h1>Terms & conditions</h1>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Maecenas volutpat blandit aliquam etiam erat velit scelerisque
                in dictum. Dictum non consectetur a erat nam at. Euismod in
                pellentesque massa placerat duis ultricies lacus. Odio tempor
                orci dapibus ultrices in. Faucibus et molestie ac feugiat sed
                lectus vestibulum. Vitae et leo duis ut diam quam nulla.
                Habitant morbi tristique senectus et netus et malesuada fames.
                Egestas erat imperdiet sed euismod nisi porta lorem. Eget sit
                amet tellus cras adipiscing enim. Integer malesuada nunc vel
                risus commodo viverra maecenas accumsan. Sed elementum tempus
                egestas sed. Purus viverra accumsan in nisl.
              </p>
              <p>
                Odio ut sem nulla pharetra diam sit amet nisl suscipit. Nec
                feugiat nisl pretium fusce id velit ut. Amet cursus sit amet
                dictum sit amet justo donec. Id velit ut tortor pretium viverra
                suspendisse potenti nullam ac. Urna nunc id cursus metus aliquam
                eleifend mi. Amet nulla facilisi morbi tempus iaculis urna id.
                Id neque aliquam vestibulum morbi blandit cursus risus at. Massa
                tempor nec feugiat nisl pretium. At erat pellentesque adipiscing
                commodo elit at imperdiet dui. Nec feugiat in fermentum posuere
                urna nec tincidunt. In cursus turpis massa tincidunt. Nunc non
                blandit massa enim nec dui. Quam pellentesque nec nam aliquam
                sem et tortor consequat. Placerat orci nulla pellentesque
                dignissim enim.
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </div>
  );
};

export { TermsAndConditions };
