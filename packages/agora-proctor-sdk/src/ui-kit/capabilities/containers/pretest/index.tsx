
import { StudentPretest } from './student-pretest';
import { observer } from "mobx-react";
import { AgoraModal } from '@/ui-kit/components/modal';


export const PretestContainer = observer(() => {
    return (
      <AgoraModal 
      centered
      open={true}
      width={731}>
        <StudentPretest/>
    </AgoraModal>
)
});
