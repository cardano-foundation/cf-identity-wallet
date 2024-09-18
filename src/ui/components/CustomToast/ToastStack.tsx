import { useAppSelector } from "../../../store/hooks";
import { getToastMgs } from "../../../store/reducers/stateCache";
import { CustomToast } from "./CustomToast";

const ToastStack = () => {
  const toastMgs = useAppSelector(getToastMgs);

  return (
    <>
      {toastMgs.map((msg, index) => (
        <CustomToast
          index={index}
          toastMsg={msg}
          key={msg.id}
        />
      ))}
    </>
  );
};

export { ToastStack };
