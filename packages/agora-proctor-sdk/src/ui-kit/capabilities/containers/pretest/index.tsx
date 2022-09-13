import { observer } from "mobx-react";

export const PretestContainer = observer(({ onOk }: { onOk: () => void }) => {
  return <div onClick={onOk}>ok</div>;
});
