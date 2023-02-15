import React, {useEffect} from 'react';
import {IonGrid, IonPage, IonRow, IonText} from '@ionic/react';
import CustomPage from '../../shared/CustomPage';
import {useSideMenuUpdate} from '../../shared/SideMenuProvider';
import {IDWCard} from '../../ui/IDWCard';
import '../../ui/idwCard.scss';
import {Swiper, SwiperSlide} from 'swiper/react';
import didsMock from '../../../test/mock/dids.json';

const Dids = (props: any) => {
  const pageName = 'My Identity';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/dids') {
      setSideMenu({
        options: sideMenuOptions,
        pageName: pageName,
      });
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={true}>
        <IonGrid>
          {Object.keys(didsMock)?.map((key) => {
            return (
              <IonRow
                key={key}
                className="ion-margin">
                <IonText color="dark">
                  <p className="title font-extrabold">did:{key}</p>
                </IonText>
                <Swiper
                  spaceBetween={10}
                  slidesPerView={
                    didsMock[key] && didsMock[key].length > 1 ? 1.2 : 1
                  }
                  loop={true}
                  onSlideChange={() => {}}
                  onSwiper={(swiper) => {}}>
                  {didsMock[key] &&
                    didsMock[key].map((did: any) => {
                      return (
                        <SwiperSlide key={did.id}>
                          <IDWCard
                            type="DID"
                            id={did.id}
                            qr={did.id}
                            name={did.name}
                            createdOn={did.createDate}
                          />
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              </IonRow>
            );
          })}
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
