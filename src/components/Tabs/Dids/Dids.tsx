import React, {useEffect} from 'react';
import {IonGrid, IonPage, IonRow, IonSlide, IonSlides} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import {DidCard} from "../../Did/DidCard";
import '../../Did/did.scss';

const Dids = (props) => {
  const pageName = 'My Identity';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/dids') {
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
          <IonRow className="ion-margin">
            did:cardano
            <IonSlides
                options={{
                  slidesPerView: 1.2,
                  loop: true,
                }}
            >
              <IonSlide><DidCard name={"hey1"}/></IonSlide>
              <IonSlide><DidCard name={"hey2"}/></IonSlide>
              <IonSlide><DidCard name={"hey3"}/></IonSlide>
            </IonSlides>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
