import { FavouriteIdentity } from "../../../store/reducers/identitiesCache/identitiesCache.types";

interface PreferencesStorageItem {
  [key: string]: string | number | boolean | Array<any>;
}

export type { PreferencesStorageItem };
