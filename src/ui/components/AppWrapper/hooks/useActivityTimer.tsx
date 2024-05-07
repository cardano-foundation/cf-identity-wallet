import { useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { useAppDispatch } from "../../../../store/hooks";
import { logout } from "../../../../store/reducers/stateCache";

const timeout = process.env.NODE_ENV === "development" ? 3600000 : 60000; // 1h/1min
const pauseTimeout = timeout / 2;
const useActivityTimer = () => {
  const dispatch = useAppDispatch();
  const [pauseTimestamp, setPauseTimestamp] = useState(0);
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
  }, []);

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
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimer();
    };
  }, []);
};

export { useActivityTimer };
