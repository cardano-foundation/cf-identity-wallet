import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPopover,
  IonRow,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import {
  toggleDark,
  isDarkMode,
  currentTheme,
  changeTheme,
} from '../../../utils/handleTheme';
import LogoDark from '../../../assets/images/cardano-logo.png';
import LogoLight from '../../../assets/images/cardano-logo-white.png';

const SideMenu = () => {
  const history = useHistory();
  const [isDark, setIsDark] = useState<boolean>(isDarkMode);
  const [theme, setTheme] = useState<string>(currentTheme);

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
    });
  };

  const handleToggleDark = () => {
    toggleDark();
    setIsDark(isDarkMode);
  };

  const handleTheme = (color: string) => {
    setTheme(color);
    changeTheme(color);
  };

  return (
    <>
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="ion-padding"
          id="main-content"
          forceOverscroll={false}>
          <IonGrid className="px-0">
            <IonRow className="py-6">
              <IonCol
                size="12"
                className="px-0">
                <IonItem>
                  <IonImg
                    src={isDark ? LogoLight : LogoDark}
                    alt="Cardano Logo"
                    className="w-24 mx-auto"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel className="text-center mx-auto">
                    Cardano Identity Wallet
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonList lines="none">
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                onIonChange={(_) => handleToggleDark()}
                checked={isDark}
                slot="end"
              />
            </IonItem>
            <IonItem>
              <IonLabel id="click-trigger">Themes</IonLabel>
              <IonPopover
                trigger="click-trigger"
                triggerAction="click">
                <IonContent
                  class="ion-padding"
                  color={theme === 'ocean' ? 'primary' : ''}
                  onClick={() => handleTheme('ocean')}>
                  Ocean
                </IonContent>
                <IonContent
                  class="ion-padding"
                  color={theme === 'sunset' ? 'primary' : ''}
                  onClick={() => handleTheme('sunset')}>
                  Sunset
                </IonContent>
                <IonContent
                  class="ion-padding"
                  color={theme === 'forest' ? 'primary' : ''}
                  onClick={() => handleTheme('forest')}>
                  Forest
                </IonContent>
                <IonContent
                  class="ion-padding"
                  color={theme === 'saver' ? 'primary' : ''}
                  onClick={() => handleTheme('saver')}>
                  Power
                </IonContent>
              </IonPopover>
            </IonItem>
            <IonItem>
              <IonMenuToggle>
                <IonLabel onClick={() => handleNavigation('/upcomingfeatures')}>
                  Upcoming Features
                </IonLabel>
              </IonMenuToggle>
            </IonItem>
            <IonItem>
              <IonLabel className="flex justify-between">
                <span>App version</span>
                <span>0.1.0</span>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
    </>
  );
};

export default SideMenu;
