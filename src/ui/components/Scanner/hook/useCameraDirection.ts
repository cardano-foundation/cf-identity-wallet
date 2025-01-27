import { LensFacing } from "@jimcase/barcode-scanning";
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
import { showError } from "../../../utils/error";

const useCameraDirection = () => {
  const dispatch = useAppDispatch();
  const cameraDirection = useAppSelector(getCameraDirection);

  const supportMultiCamera = useMemo(() => Capacitor.isNativePlatform(), []);

  const changeCameraDirection = () => {
    const newDirection =
      !cameraDirection || cameraDirection === LensFacing.Back
        ? LensFacing.Front
        : LensFacing.Back;

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
        showError("Unable to save camera direction", e, dispatch);
      });
  };

  return {
    cameraDirection,
    changeCameraDirection,
    supportMultiCamera,
  };
};

export { useCameraDirection };
