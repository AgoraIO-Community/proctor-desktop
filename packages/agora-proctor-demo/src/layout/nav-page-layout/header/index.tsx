import { FC, PropsWithChildren } from "react";
import { useHistoryBack } from "../../../hooks/useHistoryBack";
import "./index.css";
type NavHeaderProps = {
  onBack?: () => void;
  className?: string;
};
export const NavHeader: FC<PropsWithChildren<NavHeaderProps>> = ({
  onBack,
  children,
  className = "",
}) => {
  const historyBackHandle = useHistoryBack();

  const onBackHandle = () => {
    if (onBack) {
      onBack();
    } else {
      historyBackHandle();
    }
  };

  return (
    <div className={`nav-header flex ${className}`}>
      <div className="back" onClick={onBackHandle} />
      <div className="content flex-1">{children}</div>
    </div>
  );
};
