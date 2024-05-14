// TODO: Dummy type for ballot transaction. Should be remove when implement logic from core
interface SignTransactionData {
  id: string;
  address: string;
  event: string;
  category: string;
  proposal: string;
  network: string;
  votedAt: string;
  votingPower: string;
}

interface SignTransation {
  action: string;
  actionText: string;
  data: SignTransactionData;
  slot: string;
  uri: string;
  ownerUrl: string;
  eventName: string;
}

export type { SignTransation, SignTransactionData };
