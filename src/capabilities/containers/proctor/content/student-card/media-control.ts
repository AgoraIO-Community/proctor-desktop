import { bound, Injectable, Log, MediaPlayerEvents, StreamMediaPlayer } from 'agora-rte-sdk';
import { action, observable, runInAction } from 'mobx';

export enum MediaDeviceType {
  MainScreen = 'MainScreen',
  MainCamera = 'MainCamera',
  SubCamera = 'SubCamera',
}
interface MediaInstance {
  plyr: StreamMediaPlayer;
  container?: HTMLElement;
  url: string;
}
@Log.attach({ proxyMethods: false })
export class MediaController {
  logger!: Injectable.Logger;

  mediaPlyrMap: Map<MediaDeviceType, MediaInstance> = new Map();

  @observable totalDuration: number = 0;
  @observable currentTime: number = 0;
  @observable isPlaying: boolean = false;

  private _lastReloadTime: number = 0;
  private _reloadTimer: number = -1;

  get mainScreenPlyr() {
    return this.mediaPlyrMap.get(MediaDeviceType.MainScreen)?.plyr;
  }

  @action.bound
  play() {
    this.logger.info('call MediaController play');
    this.mediaPlyrMap.forEach((p) => {
      p.plyr.mediaElement?.play();
    });
    this.isPlaying = true;
  }
  @action.bound
  pause() {
    this.logger.info('call MediaController pause');

    this.mediaPlyrMap.forEach((p) => {
      p.plyr.mediaElement?.pause();
    });
    this.isPlaying = false;
  }
  setVideoUrl(type: MediaDeviceType, url: string, forceReload?: boolean) {
    this.logger.info(`setVideoUrl,type: ${type}, url: ${url}`);

    if (forceReload || !this.mediaPlyrMap.get(type)) {
      this.mediaPlyrMap.set(type, {
        url,
        plyr: new StreamMediaPlayer(url),
      });
    }
  }

  setView(type: MediaDeviceType, dom: HTMLElement) {
    const mediaPlyr = this.mediaPlyrMap.get(type);
    if (mediaPlyr) {
      mediaPlyr.plyr.setView(dom);
      mediaPlyr.plyr.play(true, true);
      this.mediaPlyrMap.set(type, { ...mediaPlyr, container: dom });
      if (type === MediaDeviceType.MainScreen) {
        this.addMediaElementListeners();
      } else {
        mediaPlyr.plyr.mediaElement?.addEventListener('fullscreenchange', () => {
          if (document.fullscreenElement) {
            mediaPlyr.plyr.mediaElement?.addEventListener('play', this.play);
            mediaPlyr.plyr.mediaElement?.addEventListener('pause', this.pause);
            this.logger.info(`Element: ${document.fullscreenElement.id} entered fullscreen mode.`);
          } else {
            mediaPlyr.plyr.mediaElement?.removeEventListener('play', this.play);
            mediaPlyr.plyr.mediaElement?.removeEventListener('pause', this.pause);
            this.logger.info('Leaving fullscreen mode.');
          }
        });
        mediaPlyr.plyr.mediaElement?.addEventListener(
          'canplay',
          () => {
            if (this.currentTime && mediaPlyr.plyr.mediaElement)
              mediaPlyr.plyr.mediaElement.currentTime = this.currentTime;
          },
          { once: true },
        );
      }
    }
  }

  syncPlyrCurrentTime(time: number) {
    this.logger.info(`syncPlyrCurrentTime: ${time}`);
    this.mediaPlyrMap.forEach((p) => {
      if (p.plyr.mediaElement) {
        p.plyr.mediaElement.currentTime = time;
      }
    });
  }

  @action.bound
  setTotalDuration() {
    const mediaElement = this.mediaPlyrMap.get(MediaDeviceType.MainScreen)?.plyr?.mediaElement;
    if (mediaElement) {
      if (this.currentTime) mediaElement.currentTime = this.currentTime;
      this.logger.info(`setTotalDuration, ${mediaElement.duration || 0}`);
      this.totalDuration = mediaElement.duration || 0;
    }
  }
  @action.bound
  setCurrentTime() {
    const mediaElement = this.mediaPlyrMap.get(MediaDeviceType.MainScreen)?.plyr?.mediaElement;
    if (mediaElement) {
      this.logger.info(`setCurrentTime, time: ${this.currentTime}`);
      this.currentTime = mediaElement.currentTime || 0;
    }
  }
  addMediaElementListeners() {
    this.logger.info(`addMediaElementListeners`);
    this.mainScreenPlyr?.mediaElement?.addEventListener('play', this.play);
    this.mainScreenPlyr?.mediaElement?.addEventListener('pause', this.pause);

    this.mainScreenPlyr?.mediaElement?.addEventListener('loadedmetadata', this.setTotalDuration);

    this.mainScreenPlyr?.mediaElement?.addEventListener('timeupdate', this.setCurrentTime);

    this.mainScreenPlyr?.mediaElement?.addEventListener('ended', this.throllteReload);
  }
  removeMediaElementListeners() {
    this.logger.info(`removeMediaElementListeners`);
    this.mainScreenPlyr?.mediaElement?.removeEventListener('play', this.play);
    this.mainScreenPlyr?.mediaElement?.removeEventListener('pause', this.pause);
    this.mainScreenPlyr?.mediaElement?.removeEventListener('loadedmetadata', this.setTotalDuration);

    this.mainScreenPlyr?.mediaElement?.removeEventListener('timeupdate', this.setCurrentTime);

    this.mainScreenPlyr?.mediaElement?.removeEventListener('ended', this.throllteReload);
  }
  @bound
  throllteReload() {
    if (this._reloadTimer !== -1) return;
    const now = new Date().getTime();
    if (now - this._lastReloadTime >= 30000) {
      this._lastReloadTime = now;
      this.reload();
    } else {
      this._reloadTimer = window.setTimeout(() => {
        this.reload();
        this._lastReloadTime = new Date().getTime();
        this._reloadTimer = -1;
      }, 30000);
    }
  }
  @bound
  reload() {
    this.logger.info(`reload`);

    this.removeMediaElementListeners();
    this.mediaPlyrMap.forEach((p, k) => {
      p.plyr.dispose();
      if (p.url && p.container) {
        this.setVideoUrl(k, p.url, true);
        this.setView(k, p.container);
      }
    });
  }
  @bound
  destroy() {
    this.logger.info(`destroy`);

    window.clearTimeout(this._reloadTimer);
    this._reloadTimer = -1;
    this._lastReloadTime = 0;
    this.removeMediaElementListeners();
    this.mediaPlyrMap.forEach((p) => {
      p.plyr.dispose();
    });
  }
  requestFullscreen(type: MediaDeviceType) {
    const plyr = this.mediaPlyrMap.get(type);
    if (plyr && plyr.plyr.mediaElement) {
      plyr.plyr.mediaElement.requestFullscreen();
    }
  }
}
