import { Provider } from "mobx-react";
import ReactDOM from "react-dom";
import { RouteContainer } from "./router";
import { HomeStore } from "./stores/home";
import { GlobalStorage } from "./utils";

export const App = () => {
  GlobalStorage.useLocalStorage();
  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
