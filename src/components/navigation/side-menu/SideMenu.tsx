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
import {changeTheme} from '../../../theme/handleTheme';
import LogoDark from '../../../assets/images/cardano-logo.png';
import LogoLight from '../../../assets/images/cardano-logo-white.png';

const SideMenu = () => {
  const history = useHistory();
  const [isDark, setIsDark] = useState(
    document.body.classList.contains('dark')
  );

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
    });
  };

  const handleTheme = () => {
    changeTheme();
    setIsDark(document.body.classList.contains('dark'));
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
                    Cardano Identity Wallet v0.1.0
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonList lines="none">
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                onIonChange={(_) => handleTheme()}
                checked={isDark ? true : false}
                slot="end"
              />
            </IonItem>
            <IonItem>
              <IonLabel id="click-trigger">Themes</IonLabel>
              <IonPopover
                trigger="click-trigger"
                triggerAction="click">
                <IonContent class="ion-padding">Ocean</IonContent>
                <IonContent class="ion-padding">Sunset</IonContent>
              </IonPopover>
            </IonItem>
            <IonItem>
              <IonMenuToggle>
                <IonLabel onClick={() => handleNavigation('/upcomingfeatures')}>
                  Upcoming Features
                </IonLabel>
              </IonMenuToggle>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
    </>
  );
};

export default SideMenu;
