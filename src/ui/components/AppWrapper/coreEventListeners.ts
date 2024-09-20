import { Agent } from "../../../core/agent/agent";
import { KeriaNotification } from "../../../core/agent/agent.types";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import { useAppDispatch } from "../../../store/hooks";
import { updateIsPending } from "../../../store/reducers/identifiersCache";
import {
  addNotification,
  setNotificationsCache,
} from "../../../store/reducers/notificationsCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

const notificatiStateChanged = (
  notif: KeriaNotification,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  dispatch(addNotification(notif));
};

const signifyOperationStateChangeHandler = async (
  { oid, opType }: { oid: string; opType: OperationPendingRecordType },
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  switch (opType) {
  case OperationPendingRecordType.Witness:
  case OperationPendingRecordType.Group:
    dispatch(updateIsPending({ id: oid, isPending: false }));
    dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
    break;
  case OperationPendingRecordType.ExchangeRevokeCredential: {
    const notifications =
        await Agent.agent.keriaNotifications.getAllNotifications();
    dispatch(setNotificationsCache(notifications));
    break;
  }
  }
};
export { notificatiStateChanged, signifyOperationStateChangeHandler };
