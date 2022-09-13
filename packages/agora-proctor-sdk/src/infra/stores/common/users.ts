import { computed } from "mobx";
import { EduUIStoreBase } from "./base";

export class UsersUIStore extends EduUIStoreBase {
  @computed get studentList() {
    return this.classroomStore.userStore.studentList;
  }
  onInstall() {}
  onDestroy() {}
}
