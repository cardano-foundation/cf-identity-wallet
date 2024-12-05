import {
  EventTypes,
  IdentifierAddedEvent,
  NotificationAddedEvent,
  NotificationRemovedEvent,
} from "../../../core/agent/event.types";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { useAppDispatch } from "../../../store/hooks";
import {
  setIdentifiersCache,
  setMultiSigGroupCache,
  updateIsPending,
  updateOrAddIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  addNotification,
  deleteNotification,
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
    case OperationPendingRecordType.Individual:
      dispatch(updateIsPending({ id: oid, isPending: false }));
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
      break;
  }
};

const identifierAddedHandler = async (
  event: IdentifierAddedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  console.log('event: ', event);
  
  const identifier = event.payload.identifier;
  if (identifier) {
    const newIdentifier: IdentifierShortDetails = {
      id: identifier.id,
      displayName: identifier.displayName,
      createdAtUTC: new Date().toISOString(),
      theme: identifier.theme,
      isPending: true,
    };

    if (identifier.groupMetadata) {
      newIdentifier.groupMetadata = identifier.groupMetadata;
    }

    dispatch(updateOrAddIdentifiersCache(newIdentifier));
  }
};

export {
  notificatiStateChanged,
  signifyOperationStateChangeHandler,
  identifierAddedHandler,
};
