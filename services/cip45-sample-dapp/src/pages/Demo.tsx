import React, { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import idwLogo from "../../public/idw.png";

interface IWalletInfoExtended {
  name: string
  address: string
  oobi: string
}
const Demo: React.FC = () => {
  const [payload, setPayload] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [error, setError] = useState<string>('');

  const defautlWallet = {
    name: "",
    address: "",
    oobi: "",
  };

  const [peerConnectWalletInfo, setPeerConnectWalletInfo] = useState<
    IWalletInfoExtended
    >(defautlWallet);

  // @ts-ignore: TS6133
  const [onPeerConnectAccept, setOnPeerConnectAccept] = useState(() => () => {
    /*TODO */
  });
  // @ts-ignore: TS6133
  const [onPeerConnectReject, setOnPeerConnectReject] = useState(() => () => {
    /*TODO */
  });

  const {
    dAppConnect,
    meerkatAddress,
    initDappConnect,
    disconnect,
  } = useCardano({
    limitNetwork: NetworkType.TESTNET,
  });

  useEffect(() => {
    if (dAppConnect.current === null) {
      const verifyConnection = (
        walletInfo: IWalletInfoExtended,
        callback: (granted: boolean, autoconnect: boolean) => void,
      ) => {
        setPeerConnectWalletInfo(walletInfo);

        setOnPeerConnectAccept(() => () => callback(true, true));
        setOnPeerConnectReject(() => () => callback(false, false));
      };

      const onApiInject = async (name: string) => {
        const api = window.cardano && window.cardano[name];
        if (api) {
          const enabledApi = await api.enable();
          const keriIdentifier =
            await enabledApi.experimental.getKeriIdentifier();

          setPeerConnectWalletInfo({
            ...peerConnectWalletInfo,
            address: keriIdentifier.id,
            oobi: keriIdentifier.oobi,
          });
        } else {
          setError( `Timeout while connecting P2P ${name} wallet`)
        }
      };

      const onApiEject = (name: string): void => {
        setPeerConnectWalletInfo(defautlWallet);
        console.log(`${name} Wallet disconnected successfully`)
        disconnect();
      };

      const onP2PConnect = (): void => {
        console.log(`onP2PConnect`)
      };

      initDappConnect(
        "Cip45 sample demo",
        window.location.href,
        verifyConnection,
        onApiInject,
        onApiEject,
        ["https://dev.btt.cf-identity-wallet.metadata.dev.cf-deployments.org"],
        onP2PConnect,
      );
    }
  }, []);

  // @ts-ignore: TS6133
  const onAcceptConnection = async () => {
    setError('');
  }

  const signMessageWithWallet = async () => {

    if (
      window.cardano &&
      window.cardano["idw_p2p"]
    ) {
      const api = window.cardano["idw_p2p"];
      const enabledApi = await api.enable();
      const signedMessage = await enabledApi.experimental.signKeri(
        peerConnectWalletInfo?.address,
        payload
      );
      if (signedMessage.error) {
        setError(signedMessage.error.code === 2
          ? "User declined to sign"
          : signedMessage.error.info)
        return;
      }
      setSignature(signedMessage);
    } else {
      setError("Wallet not connected")
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">CIP45 Demo Dapp</h1>
      <p className="mt-4 text-lg text-gray-600 text-center">Scan the QR code with your IDW wallet to proceed.</p>
      <div className="my-6 p-4 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center">
        <QRCode
          value={meerkatAddress}
          size={250}
          fgColor={"black"}
          bgColor={"white"}
          qrStyle={"squares"}
          logoImage={idwLogo}
          logoWidth={60}
          logoHeight={60}
          logoOpacity={1}
          quietZone={10}
        />
        <div className="text-sm font-semibold text-gray-500 mt-2">Meerkat Address: {meerkatAddress}</div>
      </div>
      <div className="my-6 text-center">
        <div className="h-24 mt-2">
          {peerConnectWalletInfo.address.length ? (
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-green-500 w-1/2 text-right pr-2">Connected Wallet:</p>
                <p className="text-gray-800 w-1/2 text-left pl-2">{peerConnectWalletInfo.name}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-800 w-1/2 text-right pr-2">AID:</p>
                <p className="text-gray-800 w-1/2 text-left pl-2">{peerConnectWalletInfo.address}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-800 w-1/2 text-right pr-2">OOBI:</p>
                <p className="text-gray-800 w-1/2 text-left pl-2">{peerConnectWalletInfo.oobi}</p>
              </div>
            </div>
          ) : null}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
      <div className="my-6 text-center">
                <textarea
                  className="form-textarea mt-1 block w-full rounded-lg p-4 bg-white text-gray-900"
                  rows={4}
                  placeholder="Enter payload here..."
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  disabled={!peerConnectWalletInfo}
                />
        <button className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4"
                onClick={signMessageWithWallet} disabled={!peerConnectWalletInfo || !payload.trim()}>
          Sign Payload
        </button>
      </div>
      {
        signature.length ? <>
          <p className="mt-14 bold text-xl text-gray-600 text-left">Signature:</p>
          <div className="mb-6 mt-2 p-4 bg-gray-100 rounded-lg h-24">
            <p className="text-gray-700">{signature}</p>
          </div>
        </> : null
      }

    </div>
  );
};

export { Demo };
