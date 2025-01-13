import React, { useEffect, useState } from 'react';
import { SecureStoragePlugin } from '@evva/capacitor-secure-storage-plugin';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonText, IonInput, IonItem, IonLabel, IonCard, IonCardHeader, IonCardContent } from '@ionic/react';

const SecureStorageExample: React.FC = () => {
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Retrieve the stored value on component mount
    const getStoredUsername = async () => {
      try {
        const { value } = await SecureStoragePlugin.get({ key: 'username' });
        setStoredValue(value);
      } catch (error) {
        console.log('Item with specified key does not exist.');
      }
    };

    getStoredUsername();
  }, []);

  const handleStoreValue = async () => {
    const key = 'username';
    const value = username;

    try {
      const { value: success } = await SecureStoragePlugin.set({ key, value });
      if (success) {
        console.log('Value stored successfully!');
        setStoredValue(value); // Update UI with stored value
      }
    } catch (error) {
      console.error('Failed to store the value:', error);
    }
  };

  const handleRemoveValue = async () => {
    const key = 'username';

    try {
      const { value: success } = await SecureStoragePlugin.remove({ key });
      if (success) {
        console.log('Value removed successfully!');
        setStoredValue(null); // Clear stored value in UI
      }
    } catch (error) {
      console.error('Failed to remove the value:', error);
    }
  };

  const handleClearStorage = async () => {
    try {
      const { value: success } = await SecureStoragePlugin.clear();
      if (success) {
        console.log('All storage cleared!');
        setStoredValue(null); // Clear stored value in UI
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Secure Storage Example</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonTitle>Manage Secure Storage</IonTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="floating">Enter Username</IonLabel>
              <IonInput
                value={username}
                onIonChange={(e) => setUsername(e.detail.value!)}
                debounce={0}
                placeholder="Enter username"
              />
            </IonItem>
            <IonButton expand="full" onClick={handleStoreValue} color="primary" className="ion-margin-top">
              Store Value
            </IonButton>
            <IonButton expand="full" onClick={handleRemoveValue} color="danger" className="ion-margin-top">
              Remove Value
            </IonButton>
            <IonButton expand="full" onClick={handleClearStorage} color="secondary" className="ion-margin-top">
              Clear Storage
            </IonButton>

            <div className="ion-margin-top">
              {storedValue ? (
                <IonText color="success">
                  <h2>Stored Username: {storedValue}</h2>
                </IonText>
              ) : (
                <IonText color="danger">
                  <h2>No username stored</h2>
                </IonText>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default SecureStorageExample;
