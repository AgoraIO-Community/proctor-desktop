import { MobXProviderContext } from "mobx-react";
import { useCallback, useContext, useState } from "react";
import { UserApi } from "../api/user";
import { HomeStore } from "./home";

export type HomeContext = Record<string, HomeStore>;
export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(
    MobXProviderContext as React.Context<HomeContext>
  );
  return context.store;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setLogin } = useHomeStore();
  const authWithLogout = useCallback(async () => {
    setLoading(true);
    return UserApi.shared
      .getUserInfo()
      .then(() => {
        setLogin(true);
      })
      .catch(() => {
        UserApi.shared.logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const auth = useCallback(async () => {
    if (UserApi.accessToken) {
      return UserApi.shared.getUserInfo().then(() => {
        setLogin(true);
        return true;
      });
    }
    return false;
  }, []);

  return { loading, authWithLogout, auth };
};
