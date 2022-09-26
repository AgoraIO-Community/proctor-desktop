import { AgoraEduSDK, LaunchOption } from "agora-proctor-sdk";
import { isEmpty } from "lodash";
import { observer } from "mobx-react";
import { useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useHomeStore } from "../../utils/hooks";

export const LaunchPage = observer(() => {
  const homeStore = useHomeStore();

  const history = useHistory();

  const launchOption = homeStore.launchOption || {};

  useEffect(() => {
    if (isEmpty(launchOption)) {
      history.push("/");
      return;
    }
  }, []);

  const mountLaunch = useCallback(async (dom: HTMLDivElement) => {
    if (dom) {
      AgoraEduSDK.setParameters(
        JSON.stringify({
          host: homeStore.launchOption.sdkDomain,
          uiConfigs: homeStore.launchOption.scenes,
        })
      );

      AgoraEduSDK.config({
        appId: launchOption.appId,
        region: launchOption.region ?? "CN",
      });

      // const recordUrl = `https://solutions-apaas.agora.io/apaas/record/dev/${CLASSROOM_SDK_VERSION}/record_page.html`;
      AgoraEduSDK.launch(dom, {
        ...launchOption,
        listener: (evt: any, type: any) => {
          console.log("launch#listener ", evt);

          if (evt === 2) {
            history.push(`/?reason=${type}`);
          }
        },
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
      } as unknown as LaunchOption);
    }
  }, []);

  return (
    <div
      ref={mountLaunch}
      id="app"
      className="bg-background"
      style={{ width: "100%", height: "100%" }}
    ></div>
  );
});
