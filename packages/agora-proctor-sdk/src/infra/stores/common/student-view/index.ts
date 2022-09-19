import { Log } from "agora-rte-sdk";
import { EduUIStoreBase } from "../base";

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  onInstall() {}

  onDestroy() {}
}
