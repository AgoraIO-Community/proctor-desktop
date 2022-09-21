import { EduUserStruct } from "agora-edu-core";
import { bound } from "agora-rte-sdk";
import { action, computed, observable } from "mobx";
import { EduUIStoreBase } from "./base";
import { VideosWallLayoutEnum } from "./type";

export class UsersUIStore extends EduUIStoreBase {
  @observable videosWallLayout: VideosWallLayoutEnum =
    VideosWallLayoutEnum.Compact;
  @observable currentPageIndex = 0;
  @computed get totalPage() {
    return Math.ceil(
      this.studentListByUserUuidPrefix.size / this.videosWallLayout
    );
  }
  @computed get studentListByPage() {
    return Array.from(this.studentListByUserUuidPrefix.values()).reduce(
      (prev, cur, index) => {
        if (index % this.videosWallLayout === 0) {
          prev.push([cur]);
        } else {
          prev[Math.floor(index / this.videosWallLayout)].push(cur);
        }
        return prev;
      },
      [] as string[][]
    );
  }
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
  @action.bound
  setVideosWallLayout(layout: VideosWallLayoutEnum) {
    this.videosWallLayout = layout;
  }
  @bound
  async focusUser(roomUuid: string, userUuid: string, tags: Record<any, any>) {
    return this.classroomStore.api.updateUserTags({ roomUuid, userUuid, tags });
  }

  onInstall() {}
  onDestroy() {}
}
