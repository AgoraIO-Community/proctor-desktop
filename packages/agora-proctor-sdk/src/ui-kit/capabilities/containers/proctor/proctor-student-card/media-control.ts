import { bound, MediaPlayerEvents, StreamMediaPlayer } from 'agora-rte-sdk';
import { action, observable, runInAction } from 'mobx';

export class MediaController {
  mainDeviceScreenVideoPlyr?: StreamMediaPlayer;
  mainDeviceCameraVideoPlyr?: StreamMediaPlayer;
  subDeviceCameraVideoPlyr?: StreamMediaPlayer;

  mainDeviceScreenVideoContainer?: HTMLElement;
  mainDeviceCameraVideoContainer?: HTMLElement;
  subDeviceCameraVideoContainer?: HTMLElement;

  @observable totalDuration: number = 0;
  @observable currentTime: number = 0;
  @observable isPlaying: boolean = false;

  private _lastReloadTime: number = 0;
  private _reloadTimer: number = -1;

  constructor(
    private _mainDeviceScreenVideoUrl?: string,
    private _mainDeviceCameraVideoUrl?: string,
    private _subDeviceCameraVideoUrl?: string,
  ) {}
  @bound
  async play() {
    try {
      await Promise.all([
        this.mainDeviceScreenVideoPlyr?.mediaElement?.play(),
        this.mainDeviceCameraVideoPlyr?.mediaElement?.play(),
        this.subDeviceCameraVideoPlyr?.mediaElement?.play(),
      ]);
      runInAction(() => {
        this.isPlaying = true;
      });
    } catch (e) {
      this.pause();
    }
  }
  @bound
  async pause() {
    try {
      await Promise.all([
        this.mainDeviceScreenVideoPlyr?.mediaElement?.pause(),
        this.mainDeviceCameraVideoPlyr?.mediaElement?.pause(),
        this.subDeviceCameraVideoPlyr?.mediaElement?.pause(),
      ]);
      runInAction(() => {
        this.isPlaying = false;
      });
    } catch (e) {}
  }
  setMainDeviceScreenVideoUrl(url: string) {
    this._mainDeviceScreenVideoUrl = url;
    this.mainDeviceScreenVideoPlyr = new StreamMediaPlayer(this._mainDeviceScreenVideoUrl);
  }
  setMainDeviceCameraVideoUrl(url: string) {
    this._mainDeviceCameraVideoUrl = url;
    this.mainDeviceCameraVideoPlyr = new StreamMediaPlayer(this._mainDeviceCameraVideoUrl);
  }
  setSubDeviceCameraVideoUrl(url: string) {
    this._subDeviceCameraVideoUrl = url;
    this.subDeviceCameraVideoPlyr = new StreamMediaPlayer(this._subDeviceCameraVideoUrl);
  }
  setMainDeviceScreenView(dom: HTMLElement) {
    if (this.mainDeviceScreenVideoPlyr) {
      this.mainDeviceScreenVideoContainer = dom;
      this.mainDeviceScreenVideoPlyr.setView(this.mainDeviceScreenVideoContainer);
      this.mainDeviceScreenVideoPlyr.play(true, true);
      this.addMediaElementListeners();

      this.syncPlyrCurrentTime(this.currentTime);
    }
  }
  setMainDeviceCameraView(dom: HTMLElement) {
    if (this.mainDeviceCameraVideoPlyr) {
      this.mainDeviceCameraVideoContainer = dom;
      this.mainDeviceCameraVideoPlyr.setView(this.mainDeviceCameraVideoContainer);
      this.mainDeviceCameraVideoPlyr.play(true, true);
      this.mainDeviceCameraVideoPlyr?.mediaElement?.addEventListener('play', this.play);
      this.mainDeviceCameraVideoPlyr?.mediaElement?.addEventListener('pause', this.pause);
    }
  }
  setSubDeviceCameraView(dom: HTMLElement) {
    if (this.subDeviceCameraVideoPlyr) {
      this.subDeviceCameraVideoContainer = dom;
      this.subDeviceCameraVideoPlyr.setView(this.subDeviceCameraVideoContainer);
      this.subDeviceCameraVideoPlyr.play(true, true);
      this.subDeviceCameraVideoPlyr?.mediaElement?.addEventListener('play', this.play);
      this.subDeviceCameraVideoPlyr?.mediaElement?.addEventListener('pause', this.pause);
    }
  }
  syncPlyrCurrentTime(time: number) {
    if (this.mainDeviceScreenVideoPlyr?.mediaElement)
      this.mainDeviceScreenVideoPlyr.mediaElement.currentTime = time;
    if (this.mainDeviceCameraVideoPlyr?.mediaElement)
      this.mainDeviceCameraVideoPlyr.mediaElement.currentTime = time;
    if (this.subDeviceCameraVideoPlyr?.mediaElement)
      this.subDeviceCameraVideoPlyr.mediaElement.currentTime = time;
  }
  @action.bound
  setTotalDuration() {
    this.totalDuration = this.mainDeviceScreenVideoPlyr?.mediaElement?.duration || 0;
  }
  @action.bound
  setCurrentTime() {
    this.currentTime = this.mainDeviceScreenVideoPlyr?.mediaElement?.currentTime || 0;
  }
  addMediaElementListeners() {
    this.mainDeviceScreenVideoPlyr?.mediaElement?.addEventListener(
      'loadedmetadata',
      this.setTotalDuration,
    );

    this.mainDeviceScreenVideoPlyr?.mediaElement?.addEventListener(
      'timeupdate',
      this.setCurrentTime,
    );
    this.mainDeviceScreenVideoPlyr?.mediaElement?.addEventListener('play', this.play);
    this.mainDeviceScreenVideoPlyr?.mediaElement?.addEventListener('pause', this.pause);

    this.mainDeviceScreenVideoPlyr?.mediaElement?.addEventListener('ended', this.throllteReload);
  }
  removeMediaElementListeners() {
    this.mainDeviceScreenVideoPlyr?.mediaElement?.removeEventListener(
      'loadedmetadata',
      this.setTotalDuration,
    );

    this.mainDeviceScreenVideoPlyr?.mediaElement?.removeEventListener(
      'timeupdate',
      this.setCurrentTime,
    );
    this.mainDeviceScreenVideoPlyr?.mediaElement?.removeEventListener('play', this.play);
    this.mainDeviceScreenVideoPlyr?.mediaElement?.removeEventListener('pause', this.pause);
    this.mainDeviceCameraVideoPlyr?.mediaElement?.removeEventListener('play', this.play);
    this.mainDeviceCameraVideoPlyr?.mediaElement?.removeEventListener('pause', this.pause);
    this.subDeviceCameraVideoPlyr?.mediaElement?.removeEventListener('play', this.play);
    this.subDeviceCameraVideoPlyr?.mediaElement?.removeEventListener('pause', this.pause);

    this.mainDeviceScreenVideoPlyr?.mediaElement?.removeEventListener('ended', this.throllteReload);
  }
  @bound
  throllteReload() {
    if (this._reloadTimer !== -1) return;
    const now = new Date().getTime();
    console.log(now, this._lastReloadTime, now - this._lastReloadTime);
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
    this.removeMediaElementListeners();
    this.mainDeviceCameraVideoPlyr?.dispose();
    this.subDeviceCameraVideoPlyr?.dispose();
    this.mainDeviceScreenVideoPlyr?.dispose();

    if (this._mainDeviceScreenVideoUrl && this.mainDeviceScreenVideoContainer) {
      this.setMainDeviceScreenVideoUrl(this._mainDeviceScreenVideoUrl);
      this.setMainDeviceScreenView(this.mainDeviceScreenVideoContainer);
    }
    if (this._mainDeviceCameraVideoUrl && this.mainDeviceCameraVideoContainer) {
      this.setMainDeviceCameraVideoUrl(this._mainDeviceCameraVideoUrl);
      this.setMainDeviceCameraView(this.mainDeviceCameraVideoContainer);
    }
    if (this._subDeviceCameraVideoUrl && this.subDeviceCameraVideoContainer) {
      this.setSubDeviceCameraVideoUrl(this._subDeviceCameraVideoUrl);
      this.setSubDeviceCameraView(this.subDeviceCameraVideoContainer);
    }
  }
  @bound
  destroy() {
    window.clearTimeout(this._reloadTimer);
    this._reloadTimer = -1;
    this._lastReloadTime = 0;
    this.removeMediaElementListeners();
    this.mainDeviceCameraVideoPlyr?.dispose();
    this.subDeviceCameraVideoPlyr?.dispose();
    this.mainDeviceScreenVideoPlyr?.dispose();
  }
}
