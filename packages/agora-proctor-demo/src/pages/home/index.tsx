import "./style.css";
import { EduRegion } from "agora-edu-core";
import { useEffect } from "react";
import { useHomeStore } from "../../utils/hooks";
import { getBrowserLanguage } from "../../utils";
import { LanguageEnum } from "agora-proctor-sdk";
import { HomeApi } from "./home-api";
import { HomeLaunchOption } from "src/stores/home";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "react-router";

// addResource();

const REACT_APP_AGORA_APP_SDK_DOMAIN =
  process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;
const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE =
  process.env.REACT_APP_AGORA_APP_CERTIFICATE;

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
  }
}
const regionByLang = {
  zh: EduRegion.CN,
  en: EduRegion.NA,
};
export const HomePage = () => {
  const homeStore = useHomeStore();
  const history = useHistory();

  useEffect(() => {
    const language =
      window.__launchLanguage || homeStore.language || getBrowserLanguage();
    const region =
      window.__launchRegion ||
      homeStore.region ||
      regionByLang[getBrowserLanguage()];
    homeStore.setLanguage(language as LanguageEnum);
    homeStore.setRegion(region as EduRegion);
  }, []);

  const handleSubmit = async () => {
    const language = homeStore.language || getBrowserLanguage();
    const region = homeStore.region || regionByLang[getBrowserLanguage()];

    const userRole = parseInt("1");

    const roomType = parseInt("4");

    const userUuid = `${"userName"}${userRole}`;

    const roomUuid = `${"roomName"}${roomType}`;

    try {
      const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;

      HomeApi.shared.setDomainRegion(region);

      const { token, appId } = await HomeApi.shared.loginV3(
        userUuid,
        roomUuid,
        userRole
      );

      const companyId = window.__launchCompanyId;
      const projectId = window.__launchProjectId;

      console.log("## get rtm Token from demo server", token);

      const config: HomeLaunchOption = {
        appId,
        sdkDomain: domain,
        pretest: true,
        language: language as LanguageEnum,
        userUuid: `${userUuid}`,
        rtmToken: token,
        roomUuid: `${roomUuid}`,
        roomType: roomType,
        roomName: `${"roomName"}`,
        userName: "userName",
        roleType: userRole,
        region: region as EduRegion,
        duration: +30 * 60,
        latencyLevel: 2,
      };

      config.appId = REACT_APP_AGORA_APP_ID || config.appId;

      console.log(
        `## build rtm Token ${config.rtmToken} by using RtmTokenBuilder`
      );

      homeStore.setLaunchConfig(config);
      history.push("/launch");
    } catch (e) {
      homeStore.addToast({
        id: uuidv4(),
        desc: "",

        type: "error",
      });
    } finally {
      console.log("xxx");
    }
  };
  return (
    <div>
      <button onClick={handleSubmit}>launch</button>
    </div>
  );
};
