import { EduUserStruct } from "agora-edu-core";
import { bound } from "agora-rte-sdk";
import { action, computed, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { EduUIStoreBase } from "./base";
import { StudentFilterTag, VideosWallLayoutEnum } from "./type";

export class UsersUIStore extends EduUIStoreBase {
  @observable videosWallLayout: VideosWallLayoutEnum =
    VideosWallLayoutEnum.Compact;
  @observable currentPageIndex = 0;
  @observable filterTag: StudentFilterTag = StudentFilterTag.All;
  @computed
  get totalPage() {
    return Math.ceil(
      this.studentListByUserUuidPrefix(this.filterTag).size /
        this.videosWallLayout
    );
  }
  @computed get studentListByPage() {
    return Array.from(
      this.studentListByUserUuidPrefix(this.filterTag).values()
    ).reduce((prev, cur, index) => {
      if (index % this.videosWallLayout === 0) {
        prev.push([cur]);
      } else {
        prev[Math.floor(index / this.videosWallLayout)].push(cur);
      }
      return prev;
    }, [] as string[][]);
  }
  studentListByUserUuidPrefix = computedFn((filterTag: StudentFilterTag) => {
    const studentList: Map<string, string> = new Map();
    this.studentWithGroup(filterTag).forEach((groupUuid, userUuid) => {
      const userUuidPrefix = userUuid.split("-")[0];
      if (!studentList.get(userUuidPrefix)) {
        studentList.set(userUuidPrefix, groupUuid);
      }
    });
    return studentList;
  });
  studentWithGroup = computedFn((filterTag: StudentFilterTag) => {
    const studentList: Map<string, string> = new Map();

    this.studentsFilterByTag(filterTag).forEach((user, userUuid) => {
      this.classroomStore.groupStore.groupDetails.forEach(
        (group, groupUuid) => {
          if (!!group.users.find((user) => user.userUuid === userUuid))
            studentList.set(userUuid, groupUuid);
        }
      );
    });

    return studentList;
  });
  studentsFilterByTag = computedFn((filterTag: StudentFilterTag) => {
    switch (filterTag) {
      case StudentFilterTag.All: {
        return this.classroomStore.userStore.studentList;
      }
      case StudentFilterTag.Focus: {
        const studentList: Map<string, EduUserStruct> = new Map();

        this.classroomStore.userStore.studentList.forEach((user) => {
          if (user.userProperties?.get("tags")?.focus === 1) {
            studentList.set(user.userUuid, user);
          }
        });
        return studentList;
      }
      case StudentFilterTag.Abnormal: {
        const studentList: Map<string, EduUserStruct> = new Map();

        this.classroomStore.userStore.studentList.forEach((user) => {
          if (user.userProperties?.get("tags")?.focus === 1) {
            studentList.set(user.userUuid, user);
          }
        });
        return studentList;
      }
    }
  });
  @computed get currentUserCount() {
    return (
      this.currentPageIndex * this.videosWallLayout +
      this.studentListByPage.length
    );
  }

  @action.bound
  setVideosWallLayout(layout: VideosWallLayoutEnum) {
    this.videosWallLayout = layout;
  }
  @action.bound
  setFilterTag(filterTag: StudentFilterTag) {
    this.filterTag = filterTag;
  }
  @bound
  async focusUser(roomUuid: string, userUuid: string, tags: Record<any, any>) {
    return this.classroomStore.api.updateUserTags({ roomUuid, userUuid, tags });
  }

  onInstall() {}
  onDestroy() {}
}
