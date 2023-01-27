import React from 'react';
import {useEffect} from 'react';
import {
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {changeTheme} from '../../../theme/handleTheme';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';

const Settings = (props) => {
  const pageName = 'Settings';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const handleTheme = () => {
    changeTheme();
  };
  useEffect(() => {
    if (props.location.pathname === '/tabs/settings') {
      setSideMenu({
        options: sideMenuOptions,
        side: 'start',
        pageName: pageName,
      });
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start">
        <IonGrid>
          <IonList>
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                onIonChange={(_) => handleTheme()}
                slot="end"
              />
            </IonItem>
          </IonList>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Settings;
