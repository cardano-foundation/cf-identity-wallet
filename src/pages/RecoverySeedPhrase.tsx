import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  IonCheckbox,
  IonSegment,
  IonSegmentButton,
  IonChip,
} from '@ionic/react';
import {addOutline, eyeOffOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';

/* 
  Hardcoding test values for seedphrases.
  To be removed once the real seed phrase 
  generating tool will be integrated.
  */
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
  'cushion',
  'mouse',
];

const RecoverySeedPhrase = (props) => {
  const pageName = 'Recovery Seed Phrase';
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>(seed15);
  const history = useHistory();

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
      search: '?update=true', // query string
      state: {
        seedPhrase,
      },
    });
  };

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
        <IonGrid className="min-h-[60vh]">
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel className="my-2 disclaimer-text">
                  This is your wallet secret phrase, do not share this with
                  anyone and do not store words unencrypted. We highly recommend
                  writing these down by hand and securely storing the secret
                  phrase offline.
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonSegment
                  value={`${seedPhrase.length}words`}
                  onIonChange={(event) => {
                    (event.detail.value as string) === '15words'
                      ? setSeedPhrase(seed15)
                      : setSeedPhrase(seed24);
                  }}>
                  <IonSegmentButton value="15words">
                    <IonLabel>15 words</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="24words">
                    <IonLabel>24 words</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol
              size="12"
              className={`flex flex-col justify-center ${
                view && seedPhrase.length === 15 && 'min-h-[40vh]'
              }`}>
              {view ? (
                <div className="grid grid-cols-3 gap-2 px-2">
                  {seedPhrase.map((word, index) => (
                    <IonChip
                      className="text-sm"
                      key={index}>
                      <span className="w-full text-center">{word}</span>
                    </IonChip>
                  ))}
                </div>
              ) : (
                <IonCard
                  color="dark"
                  className="text-center min-h-[16rem] flex flex-col justify-around">
                  <IonCardHeader>
                    <IonIcon
                      size="large"
                      className="mx-auto"
                      icon={eyeOffOutline}
                    />
                  </IonCardHeader>
                  <IonCardContent>
                    <p>
                      <strong>Tap to reveal the secret phrase</strong>
                    </p>
                    <p className="mt-3">
                      <strong>
                        Make sure no one is looking at this screen
                      </strong>
                    </p>
                  </IonCardContent>
                  <IonButton
                    shape="round"
                    color="dark"
                    className="w-2/6 mx-auto mb-6 reveal-button"
                    onClick={() => {
                      setView(true);
                    }}>
                    View
                  </IonButton>
                </IonCard>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className="mt-3">
          <IonRow>
            <IonCol>
              <IonItem>
                <IonCheckbox
                  slot="start"
                  checked={checked}
                  onIonChange={(e) => setChecked(e.detail.checked)}
                />
                <IonLabel className="terms-and-conditions">
                  I understand the recovery phrase cannot be provided by Cardano
                  Foundation and I must maintain secure storage of my recovery
                  phrase as detailed in the&nbsp;
                  <a href="/termsandconditions">
                    <u>Terms and Conditions</u>
                  </a>
                  .
                </IonLabel>
              </IonItem>
              <IonButton
                shape="round"
                color="dark"
                expand="block"
                className="h-auto my-4"
                disabled={!checked}
                onClick={() => handleNavigation('/verifyseedphrase')}>
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
