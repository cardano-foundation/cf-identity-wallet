import React from "react";
import "./Home.css";
import logo from "../assets/images/logo.png";

const Home = () => {
  return (
    <>
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
    </>
  );
};

export default Home;
