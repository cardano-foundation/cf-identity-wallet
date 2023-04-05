import "./style.scss";
import logo from "../../assets/images/logo.png";
import {IonPage} from "@ionic/react";

const Home = () => {
  return (
    <>
      <IonPage>
        <div className="Home">
          <header className="Home-header">
            <img
                src={logo}
                className="Home-logo"
                alt="logo"
            />
            <span
                className="Home-slogan"
                title="slogan"
            >
            Cardano Blockchain's OS Decentralised Identity (DID) &amp;
              Verifiable Credential (VC) Wallet
          </span>
          </header>
        </div>
      </IonPage>
    </>
  );
};

export default Home;
