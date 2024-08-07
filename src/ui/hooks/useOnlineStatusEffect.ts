import { useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { getIsOnline } from "../../store/reducers/stateCache";

const useOnlineStatusEffect = (
  callback: (onlineStatus: boolean) => void | never
) => {
  const isOnline = useAppSelector(getIsOnline);

  useEffect(() => {
    if (!isOnline) return;
    callback(isOnline);
  }, [isOnline, callback]);
};

export { useOnlineStatusEffect };
