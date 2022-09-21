import { Provider } from "mobx-react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import { routesMap } from "./router";
import { BizPageRouter } from "./router/type";
import { HomeStore } from "./stores/home";
import { GlobalStorage } from "./utils";

const routes: BizPageRouter[] = [
  BizPageRouter.HomePage,
  BizPageRouter.LaunchPage,
  BizPageRouter.ColorPage,
];

const RouteContainer = () => {
  return (
    <HashRouter>
      <Switch>
        {routes.map((item, index) => {
          const route = routesMap[item];
          if (!route) return null;
          return (
            <Route
              key={index}
              exact
              path={route.path}
              component={route.component}
            />
          );
        })}
      </Switch>
    </HashRouter>
  );
};

export const App = () => {
  GlobalStorage.useLocalStorage();
  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
