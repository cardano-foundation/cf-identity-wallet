import { Agent } from "@aries-framework/core";
import { IPeerIdJSON } from "./libp2p/libP2p.types";
import { MiscRecord } from "../modules";

export async function getPeerFromStorage(
  agent: Agent
): Promise<MiscRecord | null> {
  try {
    return await agent.modules.generalStorage.getMiscRecordById(
      "LIP_P2P_PEER_ID"
    );
  } catch (e) {
    return null;
  }
}
export async function savePeer(agent: Agent, value: IPeerIdJSON) {
  return await agent.modules.generalStorage.saveMiscRecord(
    new MiscRecord({
      id: "LIP_P2P_PEER_ID",
      value: JSON.stringify(value),
    })
  );
}
