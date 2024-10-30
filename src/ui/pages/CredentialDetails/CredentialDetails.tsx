import { useIonViewWillEnter } from "@ionic/react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getNextRoute } from "../../../routes/nextRoute";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import "../../components/CardDetails/CardDetails.scss";
import { CredentialDetailModule } from "../../components/CredentialDetailModule";
import {
  BackReason,
  CredHistory,
} from "../../components/CredentialDetailModule/CredentialDetailModule.types";
import { useAppIonRouter } from "../../hooks";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

const CredentialDetails = () => {
  const pageId = "credential-card-details";
  const ionRouter = useAppIonRouter();
  const history = useHistory<CredHistory>();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const params: { id: string } = useParams();
  const [navAnimation, setNavAnimation] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = (backReason: BackReason) => {
    const animation = ![BackReason.ARCHIVED, BackReason.DELETE].includes(
      backReason
    );

    setNavAnimation(animation);

    const { nextPath, updateRedux } = getNextRoute(
      TabsRoutePath.CREDENTIAL_DETAILS,
      {
        store: { stateCache },
      }
    );

    updateReduxState(
      nextPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );

    if (animation) {
      setTimeout(() => {
        ionRouter.push(nextPath.pathname, "back", "pop");
      }, NAVIGATION_DELAY);
    } else {
      ionRouter.push(nextPath.pathname, "back", "pop");
    }

    setTimeout(() => {
      setNavAnimation(false);
    }, CLEAR_ANIMATION);
  };

  return (
    <CredentialDetailModule
      pageId={pageId}
      id={params.id}
      navAnimation={navAnimation}
      onClose={handleDone}
    />
  );
};

export { CredentialDetails };
