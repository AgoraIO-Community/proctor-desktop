import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "promise-polyfill/src/polyfill";
dayjs.extend(duration);

export { FcrWebviewWidget } from "./gallery/webview";
