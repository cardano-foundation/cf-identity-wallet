import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "../../../../core/agent/agent";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getLoginAttempt,
  setLoginAttempt as setStoreLoginAttempt,
} from "../../../../store/reducers/stateCache";
import { LoginAttempts } from "../../../../core/agent/services/auth.types";

const MAX_LOGIN_ATTEMP = 5;

const useLoginAttempt = () => {
  const dispatch = useAppDispatch();
  const loginAttempt = useAppSelector(getLoginAttempt);

  const remainAttempt = MAX_LOGIN_ATTEMP - loginAttempt.attempts;

  const errorMessage = useMemo(() => {
    switch (remainAttempt) {
    case 5:
    case 4:
      return undefined;
    case 3:
    case 2:
      return i18n.t("lockpage.attempterror", {
        attempt: remainAttempt,
      });
    case 1:
    default:
      return i18n.t("lockpage.attempterror", {
        attempt: 1,
      });
    }
  }, [remainAttempt]);

  const setLoginAttempt = useCallback(
    (value: LoginAttempts) => {
      dispatch(setStoreLoginAttempt(value));
    },
    [dispatch]
  );

  const lockDuration = useMemo(() => {
    if (remainAttempt > 0) return 0;

    return loginAttempt.lockedUntil - Date.now();
  }, [loginAttempt.lockedUntil, remainAttempt]);

  const [isLock, setIsLock] = useState(lockDuration > 0);

  const incrementLoginAttempt = useCallback(async () => {
    try {
      const loginAttempt = await Agent.agent.auth.incrementLoginAttempts();
      setLoginAttempt(loginAttempt);
    } catch (e) {
      //TODO: handle error
    }
  }, [setLoginAttempt]);

  const resetLoginAttempt = useCallback(async () => {
    try {
      await Agent.agent.auth.resetLoginAttempts();
      setLoginAttempt({
        lockedUntil: Date.now(),
        attempts: 0,
      });
    } catch (e) {
      //TODO: handle error
    }
  }, [setLoginAttempt]);

  useEffect(() => {
    if (lockDuration <= 0) {
      setIsLock(false);
      return;
    }

    setIsLock(true);
    const timerId = setTimeout(() => {
      setIsLock(false);
    }, lockDuration);

    return () => {
      clearTimeout(timerId);
    };
  }, [lockDuration]);

  return {
    isLock,
    errorMessage,
    lockDuration,
    resetLoginAttempt,
    incrementLoginAttempt,
  };
};

export { useLoginAttempt };
