import {
  EventTypes,
  NotificationAddedEvent,
  NotificationRemovedEvent,
} from "../../../core/agent/event.types";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import { useAppDispatch } from "../../../store/hooks";
import { updateIsPending } from "../../../store/reducers/identifiersCache";
import {
  addNotification,
  deleteNotification,
  setNotificationsCache,
} from "../../../store/reducers/notificationsCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

const notificatiStateChanged = (
  event: NotificationRemovedEvent | NotificationAddedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  switch (event.type) {
  case EventTypes.NotificationAdded:
    dispatch(addNotification(event.payload.keriaNotif));
    break;
  case EventTypes.NotificationRemoved:
    dispatch(deleteNotification(event.payload.keriaNotif));
    break;
  default:
    break;
  }
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
  }
};
export { notificatiStateChanged, signifyOperationStateChangeHandler };
