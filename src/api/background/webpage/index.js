import { METHOD } from '../config';
import { Messaging } from '../messaging';

export const getBalance = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.getBalance });
  return result.data;
};

export const enable = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.enable });
  return result.data;
};

export const isEnabled = async () => {
  const result = await Messaging.sendToContent({ method: METHOD.isEnabled });
  return result.data;
};

//deprecated soon
export const signData = async (address, payload) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signData,
    data: { address, payload },
  });
  return result.data;
};

export const signDataCIP30 = async (address, payload) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signData,
    data: { address, payload, CIP30: true },
  });
  return result.data;
};

export const signTx = async (tx, partialSign = false) => {
  const result = await Messaging.sendToContent({
    method: METHOD.signTx,
    data: { tx, partialSign },
  });
  return result.data;
};

export const getAddress = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getAddress,
  });
  return result.data;
};

export const getRewardAddress = async () => {
  console.log("getRewardAddress in injected Messaging")
  console.log("METHOD.getRewardAddress");
  console.log(METHOD.getRewardAddress);

  //const result = "stake_test1uqald738wpra0dsnw9d672uu25qgtjvxmqzv90un97epwfse720ee";

  const result = await Messaging.sendToContent({
    method: METHOD.getRewardAddress,
  });

  console.log("result");
  console.log(result);
  return result;
};

export const getNetworkId = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getNetworkId,
  });
  return result.data;
};

export const getUtxos = async (amount = undefined, paginate = undefined) => {
  const result = await Messaging.sendToContent({
    method: METHOD.getUtxos,
    data: { amount, paginate },
  });
  return result.data;
};

export const getCollateral = async () => {
  const result = await Messaging.sendToContent({
    method: METHOD.getCollateral,
  });
  return result.data;
};

export const submitTx = async (tx) => {
  const result = await Messaging.sendToContent({
    method: METHOD.submitTx,
    data: tx,
  });
  return result.data;
};

export { on, off } from './eventRegistration';
