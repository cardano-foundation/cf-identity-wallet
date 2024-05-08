import { useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { useAppDispatch } from "../../../../store/hooks";
import { logout } from "../../../../store/reducers/stateCache";

const timeout = process.env.NODE_ENV === "development" ? 3600000 : 60000; //3600000 1h/1min
const pauseTimeout = timeout / 2;
const useActivityTimer = () => {
  const dispatch = useAppDispatch();
  const [pauseTimestamp, setPauseTimestamp] = useState(new Date().getTime());
  const timer = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  };

  const setActivityTimer = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      dispatch(logout());
    }, timeout);
  };

  const handleActivity = () => {
    setActivityTimer();
  };

  useEffect(() => {
    const pauseListener = App.addListener("pause", () => {
      const now = new Date().getTime();
      setPauseTimestamp(now);
    });

    const resumeListener = App.addListener("resume", () => {
      const now = new Date().getTime();
      if (now - pauseTimestamp > pauseTimeout) {
        dispatch(logout());
      }
    });

    return () => {
      pauseListener.remove();
      resumeListener.remove();
      clearTimer();
    };
  }, [pauseTimestamp]);

  useEffect(() => {
    const events = [
      "load",
      "mousemove",
      "touchstart",
      "touchmove",
      "click",
      "focus",
      "keydown",
      "scroll",
    ];
    events.forEach(async (event) => {
      await window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(async (event) => {
        await window.removeEventListener(event, handleActivity);
      });
      clearTimer();
    };
  }, []);
  return {
    setPauseTimestamp,
  };
};

export { useActivityTimer };
