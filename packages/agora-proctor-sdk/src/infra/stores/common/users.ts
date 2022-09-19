import { EduUserStruct } from "agora-edu-core";
import { computed } from "mobx";
import { EduUIStoreBase } from "./base";

export class UsersUIStore extends EduUIStoreBase {
  @computed get studentListByUserUuidPrefix() {
    const studentList: Map<string, string> = new Map();
    this.studentWithGroup.forEach((groupUuid, userUuid) => {
      const userUuidPrefix = userUuid.split("-")[0];
      if (!studentList.get(userUuidPrefix)) {
        studentList.set(userUuidPrefix, groupUuid);
      }
    });
    return studentList;
  }
  @computed get studentWithGroup() {
    const studentList: Map<string, string> = new Map();

    this.classroomStore.userStore.studentList.forEach((user, userUuid) => {
      this.classroomStore.groupStore.groupDetails.forEach(
        (group, groupUuid) => {
          if (!!group.users.find((user) => user.userUuid === userUuid))
            studentList.set(userUuid, groupUuid);
        }
      );
    });

    return studentList;
  }
  onInstall() {}
  onDestroy() {}
}
