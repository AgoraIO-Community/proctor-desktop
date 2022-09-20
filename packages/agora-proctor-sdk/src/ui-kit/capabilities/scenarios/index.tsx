import "antd/dist/antd.css"; // or 'antd/dist/antd.less'

import { useStore } from "@/infra/hooks/ui-store";
import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomSubtypeEnum,
  EduRoomTypeEnum,
} from "agora-edu-core";
import { observer } from "mobx-react";
import { useLayoutEffect, useState } from "react";
import { PretestContainer } from "~containers/pretest";
import { ExamineeScenario } from "./examinee";
import { ProctorScenario } from "./proctor";

export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
  roomSubtype: EduRoomSubtypeEnum;
};

export const Scenarios: React.FC<ScenariosProps> = observer(({ pretest }) => {
  const { initialize } = useStore();
  const [initialized, setInitialized] = useState(false);

  useLayoutEffect(() => {
    initialize();
    setInitialized(true);
  }, [initialize]);

  const [showPretest, setPretest] = useState(pretest);

  return initialized ? (
    showPretest ? (
      <PretestContainer onOk={() => setPretest(false)} />
    ) : (
      renderSceneByRoleType(EduClassroomConfig.shared.sessionInfo.role)
    )
  ) : null;
});

const renderSceneByRoleType = (role: EduRoleTypeEnum) => {
  switch (role) {
    case EduRoleTypeEnum.teacher:
      return <ProctorScenario />;
    case EduRoleTypeEnum.student:
      return <ExamineeScenario />;
    default:
      throw new Error(`${role} role not supported`);
  }
};
