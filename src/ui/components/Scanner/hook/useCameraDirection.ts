import { CameraDirection } from "@capacitor-community/barcode-scanner";
import { Capacitor } from "@capacitor/core";
import { useMemo } from "react";
import { Agent } from "../../../../core/agent/agent";
import { MiscRecordId } from "../../../../core/agent/agent.types";
import { BasicRecord } from "../../../../core/agent/records";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getCameraDirection,
  setCameraDirection,
} from "../../../../store/reducers/stateCache";

const useCameraDirection = () => {
  const dispatch = useAppDispatch();
  const cameraDirection = useAppSelector(getCameraDirection);

  const supportMultiCamera = useMemo(() => Capacitor.isNativePlatform(), []);

  const changeCameraDirection = () => {
    const newDirection =
      !cameraDirection || cameraDirection === CameraDirection.BACK
        ? CameraDirection.FRONT
        : CameraDirection.BACK;

    dispatch(setCameraDirection(newDirection));

    Agent.agent.basicStorage
      .createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.CAMERA_DIRECTION,
          content: {
            value: newDirection,
          },
        })
      )
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("Unable to save camera direction", e);
      });
  };

  return {
    cameraDirection,
    changeCameraDirection,
    supportMultiCamera,
  };
};

export { useCameraDirection };
