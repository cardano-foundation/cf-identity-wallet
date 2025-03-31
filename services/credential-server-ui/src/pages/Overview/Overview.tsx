import { i18n } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers/stateCache";
import {
  RoleIndex,
  roleViewText,
} from "../../components/NavBar/constants/roles";

const Overview = () => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;

  return (
    <>
      <h1>{i18n.t("pages.overview.title")}</h1>
      Viewing as: {i18n.t(roleViewText[roleViewIndex])}
    </>
  );
};

export { Overview };
