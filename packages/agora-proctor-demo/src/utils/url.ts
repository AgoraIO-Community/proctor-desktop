import { getLanguage } from "../stores/home";

export function parseUrl(locationSearch: string) {
  const result = new Object();
  if (locationSearch.indexOf("?") != -1) {
    const str = locationSearch.split("?")[1];
    const strs = str.split("&");
    for (let i = 0; i < strs.length; i++) {
      result[strs[i].split("=")[0]] = strs[i].split("=")[1];
    }
  }
  return result;
}

export const privacyPolicyURL = () => {
  if (getLanguage() === "en") {
    return "https://www.agora.io/en/privacy-policy/";
  }
  return "https://www.agora.io/cn/privacy-policy/";
};

export const useAgreementURL = () => {
  if (getLanguage() === "en") {
    return "https://www.agora.io/cn/terms-of-service/";
  }
  return "https://agora-adc-artifacts.s3.cn-north-1.amazonaws.com.cn/demo/education/privacy.html";
};

const getIndexURL = () => {
  const split = window.location.href.split("/#")[0];
  const str = split.split("#/")[0];
  return str.split("?")[0];
};

export const indexURL = getIndexURL();

/**
 * 解析hash地址中的query参数。避免query参数中用#作为值。
 * @param locationHash string
 * @returns
 */
export function parseHashUrlQuery(locationHash: string): Record<string, any> {
  const result = new Object();
  const searchIndex = locationHash.indexOf("?");
  const hashIndex = locationHash.indexOf("#");
  if (hashIndex != -1 && hashIndex > searchIndex) {
    locationHash = locationHash.split("#")[0];
  }
  if (searchIndex != -1) {
    const str = locationHash.split("?")[1];
    const strArr = str.split("&");
    for (let i = 0; i < strArr.length; i++) {
      const q = strArr[i];
      // 这里需要注意对base64值的处理，base64中是包含 = 符号的。(分享的传值是通过url传值,值是通过base64加密的)
      const match = q.match("([^=]*)=(.*)");
      if (match && match.length >= 3) {
        result[match[1]] = match[2];
      }
    }
  }
  return result;
}

type ShareContent = {
  roomId: string;
  owner: string;
};

export function encodeUrl(params: ShareContent) {
  params.owner = encodeURI(params.owner);
  const str = JSON.stringify(params);
  return window.btoa(str);
}
