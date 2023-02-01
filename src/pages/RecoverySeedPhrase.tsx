import React, {useState} from 'react';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonList,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  IonCheckbox,
} from '@ionic/react';
import {addOutline, eyeOffOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';

const RecoverySeedPhrase = (props) => {
  const pageName = 'Recovery Seed Phrase';
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState(false);
  const seed15 = [
    'dwarf',
    'knife',
    'soft',
    'era',
    'rose',
    'tired',
    'caught',
    'save',
    'talent',
    'flip',
    'shield',
    'jazz',
    'melt',
    'gaze',
    'own',
  ];
  const seed24 = [
    'rigid',
    'eternal',
    'village',
    'outside',
    'medal',
    'conduct',
    'crash',
    'rifle',
    'gesture',
    'salad',
    'unusual',
    'someone',
    'real',
    'this',
    'dash',
    'major',
    'common',
    'arrange',
    'suggest',
    'wool',
    'stick',
    'swift',
    'cushion mouse',
  ];

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/createwallet'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <IonProgressBar
          value={0.5}
          buffer={1}
        />
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonList>
                <IonItem>
                  <IonSelect
                    className="my-0 mx-auto"
                    placeholder="Select length">
                    <IonSelectOption value="apples">15 words</IonSelectOption>
                    <IonSelectOption value="oranges">24 words</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel>
                  <h4>Write down this Secret Recovery Phrase</h4>
                  <p className="mt-2">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s,
                  </p>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonCard
                color="dark"
                className="text-center py-7">
                <IonCardHeader className="pt-0">
                  <IonIcon
                    size="large"
                    icon={eyeOffOutline}
                  />
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    <strong>Tap to reveal the secret phrase</strong>
                  </p>
                  <p className="mt-3">
                    <strong>Make sure no one is looking at this screen</strong>
                  </p>
                </IonCardContent>
                <IonButton
                  shape="round"
                  color="dark"
                  size="large">
                  View
                </IonButton>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonCheckbox
                  slot="start"
                  checked={checked}
                  onIonChange={(e) => setChecked(e.detail.checked)}
                />
                <IonLabel className="terms_and_conditions">
                  I understand that if I lose my recovery phrase, I will not be
                  able to access my account{' '}
                  <a href="/termsandconditions">
                    <u>Terms</u>
                  </a>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="dark"
                expand="block"
                className="h-auto my-4"
                href="/recoveryseedphrase"
                disabled={!checked}>
                Continue
              </IonButton>
              <IonButton
                shape="round"
                color="light"
                expand="block"
                className="h-auto my-4"
                href="/tabs/crypto">
                Cancel
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default RecoverySeedPhrase;
