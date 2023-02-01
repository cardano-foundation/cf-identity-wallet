import React, {useEffect} from 'react';
import {IonGrid, IonPage, IonRow, IonSlides} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import {CategorySlide} from "../../Did/Did";
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
            yooo
            <IonSlides id="slider" options={{slidesPerView: "auto", zoom: true, grabCursor: true}}
                       className={'categorySlider'}>
              <CategorySlide name="Burgers" path="/" image='https://via.placeholder.com/150'/>
              <CategorySlide name="Sides" path="/category/sides" image='https://via.placeholder.com/150'/>
              <CategorySlide name="Chicken" path="/category/chicken" image='https://via.placeholder.com/150'/>
              <CategorySlide name="Drinks" path="/category/drinks" image='https://via.placeholder.com/150'/>
              <CategorySlide name="Veggie" path="/category/veggie" image='https://via.placeholder.com/150'/>
              <CategorySlide name="Kids" path="/category/kids" image='https://via.placeholder.com/150'/>
            </IonSlides>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
