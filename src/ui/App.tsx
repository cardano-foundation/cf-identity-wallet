import React from "react";
import logo from "./assets/images/logo.png";
import "./App.css";
import "./styles/ionic.scss";
import {setupIonicReact} from '@ionic/react';

setupIonicReact();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo"
        />
        <span
          className="App-slogan"
          title="slogan"
        >
          Cardano Blockchain's OS Decentralised Identity (DID) &amp; Verifiable
          Credential (VC) Wallet
        </span>
        <span>{VERSION}</span>
      </header>
    </div>
  );
}

export default App;
