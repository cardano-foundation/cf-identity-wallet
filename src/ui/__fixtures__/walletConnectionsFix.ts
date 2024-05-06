import { ConnectionData } from "../../store/reducers/walletConnectionsCache";
import KeriLogo from "../assets/images/KeriGeneric.jpg";

const walletConnectionsFix: ConnectionData[] = [
  {
    id: 1,
    name: "Wallet name #1",
    owner: "Nami",
    image: KeriLogo,
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
  {
    id: 2,
    name: "Wallet name #2",
    owner: "Yoroi",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
  {
    id: 3,
    name: "Wallet name #3",
    owner: "Flint",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    image: KeriLogo,
  },
  {
    id: 4,
    name: "Wallet name #4",
    owner: "",
    url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
  },
];

export { walletConnectionsFix };
