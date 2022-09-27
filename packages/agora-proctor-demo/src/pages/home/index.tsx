import { EduRegion } from "agora-edu-core";
import { EnumDeviceType, LanguageEnum } from "agora-proctor-sdk";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useHistory } from "react-router";
import { HomeLaunchOption } from "src/stores/home";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getBrowserLanguage } from "../../utils";
import { useHomeStore } from "../../utils/hooks";
import { HomeApi } from "./home-api";
import "./style.css";

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
interface inputRoomInfoRef {
  getRoomInfo: () => string;
}

export const HomePage = () => {
  const homeStore = useHomeStore();
  const history = useHistory();
  const inputRef = useRef<inputRoomInfoRef>();

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
    const roomInfo = inputRef.current
      ? JSON.parse(inputRef.current.getRoomInfo())
      : {};

    let { userRole, roomType, userName, roomName } = roomInfo;
    const userUuid =
      userRole == "1" ? userName + userRole : userName + userRole + "-main";
    const roomUuid = roomName + roomType;
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
        pretest: true, // test for now
        language: language as LanguageEnum,
        userUuid: `${userUuid}`,
        rtmToken: token,
        roomUuid: `${roomUuid}`,
        roomType: roomType,
        roomName,
        userName,
        roleType: userRole,
        region: region as EduRegion,
        duration: +30 * 60,
        latencyLevel: 2,
        deviceType: EnumDeviceType.Main,
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
      <TestRoomInfoArea ref={inputRef} />
      <button onClick={handleSubmit} type="submit">
        launch
      </button>
    </div>
  );
};

const TestRoomInfoArea = React.forwardRef((props, ref) => {
  const defaultRoomInfo = {
    userRole: 2,
    roomType: 4,
    userName: `zhanhengq111`,
    roomName: `zhanhengTestRoomq111`,
  };

  const [value, setValue] = useState<string>(
    JSON.stringify({ ...defaultRoomInfo }, null, 2)
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  useImperativeHandle(ref, () => ({
    getRoomInfo: () => {
      return value;
    },
  }));

  return <TestArea onChange={handleChange} value={value}></TestArea>;
});

const TestArea = styled.textarea`
  width: 400px;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
`;
