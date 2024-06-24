import { NotificationRoute } from "../../core/agent/agent.types";
import { NotificationsProps } from "../pages/Notifications/Notifications.types";

const notificationsFix: NotificationsProps[] = [
  {
    id: "a123456",
    createdAt: "2024-06-24T13:30:00Z",
    label: "DVLA has requested a Driver’s Licence credential from you ",
    read: false,
    route: NotificationRoute.MultiSigIcp,
    connectionId: "123456",
  },
  {
    id: "b123456",
    createdAt: "2024-06-20T12:00:00Z",
    label: "DVLA has requested a Driver’s Licence credential from you ",
    read: true,
    route: NotificationRoute.MultiSigRot,
    connectionId: "123456",
  },
  {
    id: "c123456",
    createdAt: "2024-04-10T12:00:00Z",
    label: "DVLA has requested a Driver’s Licence credential from you ",
    read: true,
    route: NotificationRoute.ExnIpexGrant,
    connectionId: "123456",
  },
  {
    id: "d123456",
    createdAt: "2023-02-18T12:00:00Z",
    label: "DVLA has requested a Driver’s Licence credential from you ",
    read: true,
    route: NotificationRoute.ExnIpexApply,
    connectionId: "123456",
  },
];

export { notificationsFix };
