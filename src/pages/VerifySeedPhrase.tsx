import React, {useEffect, useState} from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import {
  IonCol,
  IonGrid,
  IonPage,
  IonProgressBar,
  IonRow,
  IonButton,
  IonChip,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {shuffle} from '../utils/utils';

const VerifySeedPhrase = (props) => {
  const pageName = 'Verify Seed Phrase';
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedMatch, setSeedMatch] = useState<string[]>([]);
  const location = useLocation();
  const history = useHistory();

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
      search: '?update=true',
      state: {
        seedPhrase,
      },
    });
  };

  useEffect(() => {
    const seedPhrase = location.state.seedPhrase as string[];
    if (seedPhrase.length) {
      setSeedPhrase(shuffle(seedPhrase));
    }
  }, []);

  const addSeedMatch = (word: string, index: number) => {
    setSeedMatch((seedMatch) => [...seedMatch, word]);
    setSeedPhrase((seedPhrase) =>
      seedPhrase.filter((arr, i) => arr !== word && index !== i)
    );
  };

  const removeSeedMatch = (word: string, index: number) => {
    setSeedPhrase((seedPhrase) => [...seedPhrase, word]);
    setSeedMatch((seedMatch) =>
      seedMatch.filter((arr, i) => arr !== word && index !== i)
    );
  };

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/recoveryseedphrase'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <IonProgressBar
          value={0.75}
          buffer={1}
        />
        <IonGrid className="min-h-[60vh]">
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel className="my-2 disclaimer-text">
                  Enter your secret recovery seed phrase in the correct order to
                  continue to the next step.
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <div className="grid grid-cols-3 gap-2 p-2 m-2 border min-h-[6rem]">
                {seedMatch.map((word, index) => (
                  <IonChip
                    className="text-sm"
                    key={index}
                    onClick={(event) => {
                      removeSeedMatch(word, index);
                    }}>
                    <span className="w-full text-left">
                      <span className="text-gray-500 mr-2">{index + 1}</span>
                      <span>{word}</span>
                    </span>
                  </IonChip>
                ))}
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <div className="grid grid-cols-3 gap-2 px-2 m-2">
                {seedPhrase.map((word, index) => (
                  <IonChip
                    className="text-sm"
                    key={index}
                    onClick={(event) => {
                      addSeedMatch(word, index);
                    }}>
                    <span className="w-full text-center">{word}</span>
                  </IonChip>
                ))}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className="mt-3">
          <IonRow>
            <IonCol>
              <IonButton
                shape="round"
                color="dark"
                expand="block"
                className="h-auto my-4"
                onClick={() => handleNavigation('/tabs/crypto')}
                disabled={false}>
                Continue
              </IonButton>
              <IonButton
                shape="round"
                color="light"
                expand="block"
                className="h-auto my-4"
                onClick={() => handleNavigation('/tabs/crypto')}>
                Cancel
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default VerifySeedPhrase;
