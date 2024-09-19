import { useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { getIsOnline } from "../../store/reducers/stateCache";

const useOnlineStatusEffect = (callback: () => void | never) => {
  const isOnline = useAppSelector(getIsOnline);

  useEffect(() => {
    if (!isOnline) return;
    callback();
  }, [isOnline, callback]);
};

export { useOnlineStatusEffect };
