import { ConnectionData } from "../../store/reducers/walletConnectionsCache";
import KeriLogo from "../assets/images/KeriGeneric.jpg";

const walletConnectionsFix: ConnectionData[] = [
  {
    id: "1",
    name: "Wallet name #1",
    selectedAid: "Nami",
    iconB64: KeriLogo,
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
  {
    id: "2",
    name: "Wallet name #2",
    selectedAid: "Yoroi",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
  {
    id: "3",
    name: "Wallet name #3",
    selectedAid: "Flint",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    iconB64: KeriLogo,
  },
  {
    id: "4",
    name: "Wallet name #4",
    selectedAid: "Yume",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
];

export { walletConnectionsFix };
