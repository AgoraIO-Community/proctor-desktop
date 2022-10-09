import { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { AuthLayout } from '../layout/auth-layout';
import { BrowserCheckLayout } from '../layout/browser-check-layout';
import { routesMap } from './maps';
import { PageRouter } from './type';

const routes: PageRouter[] = [
  PageRouter.Launch,

  PageRouter.Index,

  PageRouter.PretestPage,
  // PageRouter.Home,
];
export const RouteContainer = () => {
  const browserCheckIncludes = useMemo(() => {
    // const list = [PageRouter.Index, PageRouter.Welcome, PageRouter.JoinRoom];
    // return list.map((v) => routesMap[v].path);
    return [];
  }, []);

  const authIncludes = useMemo(() => {
    const list = [PageRouter.JoinRoom];
    return list.map((v) => routesMap[v].path);
  }, []);

  return (
    <HashRouter>
      <AuthLayout includes={authIncludes}>
        <BrowserCheckLayout includes={browserCheckIncludes}>
          <Switch>
            {routes.map((item, index) => {
              const route = routesMap[item];
              if (!route) return null;
              return (
                <Route
                  key={item + index}
                  exact={!!route.exact}
                  path={route.path}
                  component={route.component}
                />
              );
            })}
          </Switch>
        </BrowserCheckLayout>
      </AuthLayout>
    </HashRouter>
  );
};
