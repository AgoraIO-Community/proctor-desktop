import { DeviceTypeEnum } from "@/infra/api";
import { EduClassroomConfig, EduUserStruct } from "agora-edu-core";
import { bound } from "agora-rte-sdk";
import md5 from "js-md5";
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
      this.studentListByUserUuidPrefix(this.filterTag).entries()
    ).reduce((prev, cur, index) => {
      const [userUuidPrefix] = cur;
      if (index % this.videosWallLayout === 0) {
        prev.push([userUuidPrefix]);
      } else {
        prev[Math.floor(index / this.videosWallLayout)].push(userUuidPrefix);
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
          if (!!user.userProperties?.get("tags")?.abnormal) {
            studentList.set(user.userUuid, user);
          }
        });
        return studentList;
      }
      default: {
        return this.classroomStore.userStore.studentList;
      }
    }
  });
  @computed get currentUserCount() {
    return (
      this.currentPageIndex * this.videosWallLayout +
      (this.studentListByPage[this.currentPageIndex]?.length || 0)
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
  async updateUserTags(
    roomUuid: string,
    userUuid: string,
    tags: Record<any, any>
  ) {
    return this.classroomStore.api.updateUserTags({ roomUuid, userUuid, tags });
  }
  @bound
  async queryUserEvents(roomUuid: string, userUuid: string, cmd?: number) {
    return this.classroomStore.api.queryRoomEvents({ roomUuid, userUuid, cmd });
  }
  @bound
  async queryRecordList(roomUuid: string, nextId?: number) {
    return this.classroomStore.api.queryRecordList({ roomUuid, nextId });
  }
  generateGroupUuid(userUuidPrefix: string) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    return md5(`${roomUuid}-${userUuidPrefix}`);
  }
  generateDeviceUuid(userUuidPrefix: string, deviceType: DeviceTypeEnum) {
    return `${userUuidPrefix}-${deviceType}`;
  }
  onInstall() {}
  onDestroy() {}
}
