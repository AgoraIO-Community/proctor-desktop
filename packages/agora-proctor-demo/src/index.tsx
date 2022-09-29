import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Provider } from "mobx-react";
import ReactDOM from "react-dom";
import { addResource } from "./components/i18n";
import { RouteContainer } from "./router";
import { HomeStore } from "./stores/home";
import { GlobalStorage, init } from "./utils";

declare global {
  interface Window {
    __launchRegion: string;
    __launchLanguage: string;
    __launchRoomName: string;
    __launchUserName: string;
    __launchRoleType: string;
    __launchRoomType: string;
    __launchCompanyId: string;
    __launchProjectId: string;
    __accessToken: string;
    __refreshToken: string;
  }
}

init();

dayjs.extend(duration);
addResource();

export const App = () => {
  GlobalStorage.useLocalStorage();
  return (
    <Provider store={new HomeStore()}>
      <RouteContainer />
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
