import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonButton,
  IonChip,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonSegment,
  IonSegmentButton,
  useIonAlert,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../layouts/PageLayout';
import {CardanoAPI} from '../../lib/CardanoAPI';
import {autoCompleteData} from '../../test/mock/data';

const SubmitSeedPhrase = ({}) => {
  const pageName = 'Verify Seed Phrase';
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsActive, setSuggestionsActive] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhraseLength, setSeedPhraseLength] = useState<string>('15');
  const [presentAlert] = useIonAlert();

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
    });
  };

  const addWord = (word: string, i: number) => {
    setSeedPhrase((seedPhrase) => [...seedPhrase, word]);
    setSuggestions([]);
    setInputValue('');
    setSuggestionsActive(false);
  };

  const removeWordFromArray = (array: string[], word: string) => {
    const cp = [...array];
    const index = cp.indexOf(word);
    if (index > -1) {
      cp.splice(index, 1);
    }
    return cp;
  };

  const removeWord = (word: string, i: number) => {
    setSeedPhrase((seedPhrase) => removeWordFromArray(seedPhrase, word));
  };

  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    setInputValue(query);
    if (query.length > 1) {
      const filterSuggestions = autoCompleteData.filter(
        (suggestion: string) => suggestion.toLowerCase().indexOf(query) > -1
      );
      setSuggestions(filterSuggestions);
      setSuggestionsActive(true);
    } else {
      setSuggestionsActive(false);
    }
  };

  const Suggestions = () => {
    return (
      <div className="grid grid-cols-3 gap-2 px-2 m-2">
        {suggestions.map((suggestion, index) => (
          <IonChip
            className="text-sm"
            key={index}
            onClick={(event) => {
              addWord(suggestion, index);
            }}>
            <span className="w-full text-center">{suggestion}</span>
          </IonChip>
        ))}
      </div>
    );
  };

  const submitWalletRecovery = () => {
    const validateMnemonic = CardanoAPI.validateSeedPhrase(
      seedPhrase.join(' ')
    );
    validateMnemonic
      ? handleNavigation('/tabs/crypto')
      : presentAlert({
          header: 'Error',
          message: `Please check your Seed Phrase and try again.`,
          buttons: ['OK'],
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
        backButtonPath={'/recoverwallet'}
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
              <IonItem>
                <IonSegment
                  value={seedPhraseLength}
                  onIonChange={(event) => {
                    setSeedPhraseLength(event.detail.value as string);
                  }}>
                  <IonSegmentButton value="12">
                    <IonLabel>12 words</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="15">
                    <IonLabel>15 words</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="24">
                    <IonLabel>24 words</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <div className="grid grid-cols-3 gap-2 p-2 m-2 border min-h-[6rem]">
                {seedPhrase.map((word, index) => (
                  <IonChip
                    className="text-sm"
                    key={index}
                    onClick={(event) => {
                      removeWord(word, index);
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
            <IonCol className="m-2">
              <IonInput
                type="text"
                value={inputValue}
                placeholder="Start typing here"
                className="bg-white text-black placeholder:text-gray-500"
                onIonChange={handleChange}
              />
              {suggestionsActive && <Suggestions />}
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className="mt-3">
          <IonRow>
            <IonCol>
              <IonButton
                shape="round"
                color="primary"
                expand="block"
                className="h-auto my-4"
                onClick={() => submitWalletRecovery()}
                disabled={seedPhrase.length !== Number(seedPhraseLength)}>
                Continue
              </IonButton>
              <IonButton
                shape="round"
                expand="block"
                className="h-auto my-4 secondary-button"
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

export default SubmitSeedPhrase;
