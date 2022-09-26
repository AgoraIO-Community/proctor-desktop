import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useHistory } from "react-router-dom";
import {
  AButton,
  ADivider,
  AList,
  AListItem,
  AModal,
  ASkeleton,
  SvgIconEnum,
  SvgImg,
  transI18n,
} from "~ui-kit";
import { RoomAPI, RoomInfo } from "../../api/room";
import { UserApi } from "../../api/user";
import CreateClassIcon from "../../assets/fcr_create_class.svg";
import JoinClassIcon from "../../assets/fcr_join_class.svg";
import roomListEmptyImg from "../../assets/welcome-empty-list.png";
import { Settings } from "../../components/settings";
import { useAuth, useHomeStore } from "../../hooks";
import { encodeUrl } from "../../utils/url";
import "./index.css";
import { RoomListItem } from "./room-list";
import { RoomToast } from "./room-toast";

export const Welcome = observer(() => {
  const [settingModal, setSettingModal] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const nextRoomID = useRef<RoomInfo["roomId"]>();
  const { isLogin } = useHomeStore();
  const { auth } = useAuth();

  const [total, setTotal] = useState(30);
  const history = useHistory();

  const fetchMoreRoomList = useCallback(() => {
    setFetching(true);
    RoomAPI.shared
      .list({ nextId: nextRoomID.current })
      .then((response) => {
        const { list, nextId, total } = response.data.data;
        nextRoomID.current = nextId;
        setTotal(total);
        setRoomList((pre) => {
          return [...pre, ...list];
        });
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const refreshRoomList = useCallback(() => {
    setFetching(true);
    RoomAPI.shared
      .list()
      .then((response) => {
        const { list, nextId, total } = response.data.data;
        nextRoomID.current = nextId;
        setTotal(total);
        setRoomList(list);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const onJoin = useCallback((data: RoomInfo) => {
    const query = encodeUrl({
      roomId: data.roomId,
      owner: UserApi.shared.nickName,
    });
    history.push(`/join-room?${query}`);
  }, []);

  const onDetail = useCallback((data: RoomInfo) => {}, []);

  useEffect(() => {
    if (isLogin) {
      refreshRoomList();
    } else {
      auth();
    }
  }, [isLogin]);

  return (
    <div className="welcome-container">
      <header className="flex items-center justify-end">
        <AButton
          className={"settings"}
          icon={<SvgImg type={SvgIconEnum.SETTINGS} size={13} />}
          onClick={() => {
            setSettingModal(true);
          }}
        >
          {transI18n("fcr_settings_setting")}
        </AButton>
      </header>
      <div
        className={`content ${roomList.length ? "" : "room-list-empty"}`}
        id="scrollableDiv"
      >
        <div className="welcome-title">
          {transI18n("fcr_home_label_welcome_message")}
        </div>
        <div className="room-list-empty-img">
          <img src={roomListEmptyImg} alt="" />
        </div>
        <div className={`room-entry`}>
          <div
            className="btn"
            onClick={() => {
              if (!isLogin) {
                UserApi.shared.login();
                return;
              }
              history.push("/join-room");
            }}
          >
            <span className="icon">
              <img src={JoinClassIcon} alt="join class" />
            </span>
            <span className="text">{transI18n("fcr_home_button_join")}</span>
          </div>
          <div
            className="btn"
            onClick={() => {
              if (!isLogin) {
                UserApi.shared.login();
              }
              history.push("/create-room");
            }}
          >
            <span className="icon">
              <img src={CreateClassIcon} alt="create class" />
            </span>
            <span className="text">{transI18n("fcr_home_button_create")}</span>
          </div>
        </div>
        <div className={`room-list flex-1`}>
          <div className="title">
            <span>{transI18n("fcr_home_label_roomlist")}</span>
          </div>
          <RoomToast />
          <InfiniteScroll
            dataLength={roomList.length}
            next={fetchMoreRoomList}
            hasMore={roomList.length < total}
            loader={
              <ASkeleton
                paragraph={{
                  rows: 3,
                }}
                active
              />
            }
            endMessage={
              <ADivider plain className="no-more">
                {transI18n("fcr_home_label_room_list_no_more")}
              </ADivider>
            }
            scrollableTarget="scrollableDiv"
          >
            <AList<RoomInfo>
              className="list"
              dataSource={roomList}
              rowKey="roomId"
              loading={fetching}
              renderItem={(item: RoomInfo) => (
                <AListItem>
                  <RoomListItem
                    data={item}
                    onJoin={onJoin}
                    onDetail={onDetail}
                  />
                </AListItem>
              )}
            ></AList>
          </InfiniteScroll>
        </div>
      </div>
      <div className="room-list-mask" />
      <AModal
        className="setting-modal-container"
        open={settingModal}
        bodyStyle={{ padding: 0 }}
        title={transI18n("fcr_settings_setting")}
        width={730}
        onCancel={() => {
          setSettingModal(false);
        }}
        footer={false}
      >
        <Settings />
      </AModal>
    </div>
  );
});
