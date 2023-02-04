import React, {useEffect} from 'react';
import {IonGrid, IonPage, IonRow, IonText} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import {DidCard} from "../../Did/DidCard";
import '../../Did/did.scss';
import {Swiper, SwiperSlide} from 'swiper/react';

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
            <IonText color="dark">
              <p className="title">DID:key</p>
            </IonText>
            <Swiper
                spaceBetween={10}
                slidesPerView={1.2}
                loop={true}
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
            >
              <SwiperSlide>
                <DidCard id="1" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
              <SwiperSlide>
                <DidCard id="2" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
              <SwiperSlide>
                <DidCard id="3" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
            </Swiper>
          </IonRow>
          <IonRow className="ion-margin">
            <IonText color="dark">
              <p className="title">DID:key</p>
            </IonText>
            <Swiper
                spaceBetween={10}
                slidesPerView={1.2}
                loop={true}
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
            >
              <SwiperSlide>
                <DidCard id="1" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
              <SwiperSlide>
                <DidCard id="2" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
              <SwiperSlide>
                <DidCard id="3" name={"Thomas A. Mayfield"} expDate="expiration date"/>
              </SwiperSlide>
            </Swiper>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
