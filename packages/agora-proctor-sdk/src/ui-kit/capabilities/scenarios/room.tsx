import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';

type Props = {
  children?: React.ReactNode;
};

const Room: FC<Props> = observer(({ children }) => {
  const { initialize, join, destroy } = useStore();

  useEffect(() => {
    initialize();
    join();
    return destroy;
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
});

export default Room;
