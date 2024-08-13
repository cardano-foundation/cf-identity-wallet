import { useSelector } from "react-redux";
import { getStateCache } from "../../../store/reducers/stateCache";
import { VerifyPassword } from "../VerifyPassword";
import { VerifyPasscode } from "../VerifyPasscode";
import { VerifyProps } from "./Verification";

const Verification = ({
  verifyIsOpen,
  setVerifyIsOpen,
  onVerify,
}: VerifyProps) => {
  const stateCache = useSelector(getStateCache);
  const authentication = stateCache.authentication;

  return authentication.passwordIsSet ? (
    <VerifyPassword
      isOpen={verifyIsOpen}
      setIsOpen={setVerifyIsOpen}
      onVerify={onVerify}
    />
  ) : (
    <VerifyPasscode
      isOpen={verifyIsOpen}
      setIsOpen={setVerifyIsOpen}
      onVerify={onVerify}
    />
  );
};

export { Verification };
