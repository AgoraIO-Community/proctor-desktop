import { Log } from "agora-rte-sdk";
import { EduUIStoreBase } from "../base";

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  //   /**
  //    * 教室时间信息
  //    * @returns
  //    */
  //   @computed
  //   get classroomSchedule() {
  //     return this.classroomStore.roomStore.classroomSchedule;
  //   }

  //   /**
  //    * 教室状态
  //    * @returns
  //    */
  //   @computed
  //   get classState() {
  //     return this.classroomSchedule.state;
  //   }

  //   /**
  //    * 服务器时间
  //    * @returns
  //    */
  //   @computed
  //   get calibratedTime() {
  //     const { clockTime, clientServerTimeShift } = this.classroomStore.roomStore;
  //     return clockTime + clientServerTimeShift;
  //   }

  //   @computed
  //   get classTimeDuration(): number {
  //     let duration = -1;
  //     if (this.classroomSchedule) {
  //       switch (this.classState) {
  //         case ClassState.beforeClass:
  //           if (this.classroomSchedule.startTime !== undefined) {
  //             duration = Math.max(
  //               this.classroomSchedule.startTime - this.calibratedTime,
  //               0
  //             );
  //           }
  //           break;
  //         case ClassState.ongoing:
  //           if (this.classroomSchedule.startTime !== undefined) {
  //             duration = Math.max(
  //               this.calibratedTime - this.classroomSchedule.startTime,
  //               0
  //             );
  //           }
  //           break;
  //         case ClassState.afterClass:
  //           if (
  //             this.classroomSchedule.startTime !== undefined &&
  //             this.classroomSchedule.duration !== undefined
  //           ) {
  //             duration = Math.max(
  //               this.calibratedTime - this.classroomSchedule.startTime,
  //               0
  //             );
  //           }
  //           break;
  //       }
  //     }
  //     return duration;
  //   }

  // /**
  //    * 倒计时格式化
  //    * @param time
  //    * @param mode
  //    * @returns
  //    */
  //  formatCountDown(time: number, mode: TimeFormatType): string {
  //   const seconds = Math.floor(time / 1000);
  //   const duration = dayjs.duration(time);
  //   let formatItems: string[] = [];

  //   const hours_text = duration.hours() === 0 ? '' : `H :`;
  //   const mins_text = duration.minutes() === 0 ? '' : duration.seconds() === 0 ? `m :` : `m :`;
  //   const seconds_text = duration.seconds() === 0 ? '' : `s`;
  //   const short_hours_text = `HH :`;
  //   const short_mins_text = `mm :`;
  //   const short_seconds_text = `ss`;
  //   if (mode === TimeFormatType.Timeboard) {
  //     // always display all time segment
  //     if (seconds < 60 * 60) {
  //       // less than a min
  //       formatItems = [short_mins_text, short_seconds_text];
  //     } else {
  //       formatItems = [short_hours_text, short_mins_text, short_seconds_text];
  //     }
  //   } else {
  //     // do not display time segment if it's 0
  //     if (seconds < 60) {
  //       // less than a min
  //       formatItems = [seconds_text];
  //     } else if (seconds < 60 * 60) {
  //       [mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
  //     } else {
  //       [hours_text, mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
  //     }
  //   }
  //   return duration.format(formatItems.join(' '));
  // }

  //   // computed
  //   /**
  //    * 教室状态文字
  //    * @returns
  //    */
  //    @computed
  //    get classStatusText() {
  //      const duration = this.getters || 0;

  //      if (duration < 0) {
  //        // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
  //        return `-- : --`;
  //      }
  //      switch (this.classState) {
  //        case ClassState.beforeClass:
  //          return `${transI18n('nav.to_start_in')}${this.formatCountDown(
  //            duration,
  //            TimeFormatType.Timeboard,
  //          )}`;
  //        case ClassState.ongoing:
  //          return `${transI18n('nav.started_elapse')}${this.formatCountDown(
  //            duration,
  //            TimeFormatType.Timeboard,
  //          )}`;
  //        case ClassState.afterClass:
  //          return `${transI18n('nav.ended_elapse')}${this.formatCountDown(
  //            duration,
  //            TimeFormatType.Timeboard,
  //          )}`;
  //        default:
  //          // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
  //          return `-- : --`;
  //      }
  //    }

  onInstall() {}

  onDestroy() {}
}
