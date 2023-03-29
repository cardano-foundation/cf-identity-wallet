import React from "react";
import "./Home.css";
import logo from "../assets/images/logo.png";

const Home = () => {
  return (
    <>
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
            Cardano Blockchain's OS Decentralised Identity (DID) &amp;
            Verifiable Credential (VC) Wallet
          </span>
          <span>{VERSION}</span>
        </header>
      </div>
    </>
  );
};

export default Home;
