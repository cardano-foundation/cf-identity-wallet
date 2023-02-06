import React, {useEffect} from 'react';
import {IonGrid, IonPage, IonRow, IonText} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import {DidCard} from "../../Did/DidCard";
import '../../Did/did.scss';
import {Swiper, SwiperSlide} from 'swiper/react';
import didsMock from '../../../test/mock/dids.json';

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

  console.log("didsMock");
  console.log(didsMock);

  return (
      <IonPage id={pageName}>
        <CustomPage
            name={pageName}
            sideMenu={false}
            sideMenuPosition="start">
          <IonGrid>
            {Object.keys(didsMock)?.map(key => {
              console.log('didsMock[key]');
              console.log(didsMock[key]);
              return <IonRow className="ion-margin">
                <IonText color="dark">
                  <p className="title">DID:{key}</p>
                </IonText>
                <Swiper
                    spaceBetween={10}
                    slidesPerView={didsMock[key] && didsMock[key].length > 1 ? 1.2 : 1}
                    loop={true}
                    onSlideChange={() => console.log('slide change')}
                    onSwiper={(swiper) => console.log(swiper)}
                >
                  {
                    didsMock[key] && didsMock[key].map(did => {
                      return <SwiperSlide>
                        <DidCard id={did.id} name={did.name} expDate={did.createDate}/>
                      </SwiperSlide>
                    })
                  }
                </Swiper>
              </IonRow>
            })}
          </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
