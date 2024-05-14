import { BallotTransation } from "../../store/reducers/stateCache/stateCache.types";

const ballotTransactionFix: BallotTransation = {
  action: "CAST_VOTE",
  actionText: "Cast Vote",
  data: {
    id: "2658fb7d-cd12-48c3-bc95-23e73616b79f",
    address: "stake_test1uzpq2pktpnj54e64kfgjkm8nrptdwfj7s7fvhp40e98qsusd9z7ek",
    event: "CF_TEST_EVENT_01",
    category: "CHANGE_SOMETHING",
    proposal: "YES",
    network: "PREPROD",
    votedAt: "40262406",
    votingPower: "10444555666",
  },
  slot: "40262407",
  uri: "https://evoting.cardano.org/voltaire",
  ownerUrl: "https://voting.summit.cardano.org",
  eventName: "Cardano Summit Voting Awards",
};

export { ballotTransactionFix };
