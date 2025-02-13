import { useIonViewWillEnter } from "@ionic/react";
import { useCallback, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import "../../components/CardDetails/CardDetails.scss";
import { IdentifierDetailModule } from "../../components/IdentifierDetailModule";
import { useAppIonRouter } from "../../hooks";

const NAVIGATION_DELAY = 250;
const CLEAR_ANIMATION = 1000;

const IdentifierDetails = () => {
  const pageId = "identifier-card-details";
  const ionRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const params: { id: string } = useParams();
  const [navAnimation, setNavAnimation] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: history.location.pathname }));
  });

  const handleDone = useCallback(
    (animation = true) => {
      setNavAnimation(animation);
      const { backPath, updateRedux } = getBackRoute(
        TabsRoutePath.IDENTIFIER_DETAILS,
        {
          store: { stateCache },
        }
      );

      updateReduxState(
        backPath.pathname,
        { store: { stateCache } },
        dispatch,
        updateRedux
      );

      if (animation) {
        setTimeout(() => {
          ionRouter.push(backPath.pathname, "back", "pop");
        }, NAVIGATION_DELAY);
      } else {
        ionRouter.push(backPath.pathname, "back", "pop");
      }

      setTimeout(() => {
        setNavAnimation(false);
      }, CLEAR_ANIMATION);
    },
    [dispatch, ionRouter, stateCache]
  );

  return (
    <IdentifierDetailModule
      identifierDetailId={params.id}
      onClose={handleDone}
      navAnimation={navAnimation}
      pageId={pageId}
    />
  );
};

export { IdentifierDetails };
