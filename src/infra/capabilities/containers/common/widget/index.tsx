import { useStore } from '@proctor/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './index.css';
import { TrackCore } from './track';
import {
  AgoraWidgetTrackSynced,
  AgoraCloudClassWidget as AgoraWidgetBase,
} from 'agora-common-libs';

export const WidgetContainer = observer(() => {
  const {
    widgetUIStore: { z0Widgets, z10Widgets },
  } = useStore();

  return (
    <React.Fragment>
      <div className="widget-container fcr-z-0">
        {z0Widgets.map((w: AgoraWidgetBase) => (
          <Widget key={w.widgetId} widget={w} />
        ))}
      </div>
      <div className="widget-container fcr-z-10">
        {z10Widgets.map((w: AgoraWidgetBase) => (
          <Widget key={w.widgetId} widget={w} />
        ))}
      </div>
    </React.Fragment>
  );
});

const Widget = observer(({ widget }: { widget: AgoraWidgetBase }) => {
  const containerDom = useRef<HTMLElement>();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const locatedNode = widget.locate();

    if (locatedNode) {
      containerDom.current = locatedNode;
    }

    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const renderWidgetInner = () => {
    const tsw = widget as unknown as AgoraWidgetTrackSynced;
    if (tsw.track) {
      return (
        <WidgetTrackControl widget={widget}>
          <div
            ref={(ref) => {
              if (ref) widget.render(ref);
              else widget.unload();
            }}
          />
        </WidgetTrackControl>
      );
    } else {
      return (
        <div
          ref={(ref) => {
            if (ref) widget.render(ref);
            else widget.unload();
          }}
        />
      );
    }
  };

  if (mounted) {
    if (containerDom.current) {
      return createPortal(renderWidgetInner(), containerDom.current);
    }
    return renderWidgetInner();
  }

  return null;
});

const WidgetTrackControl: FC<PropsWithChildren<{ widget: AgoraWidgetBase }>> = observer(
  ({ widget, children }) => {
    const tsw = widget;

    const {
      track,
      zIndex,
      minHeight,
      minWidth,
      draggable,
      resizable,
      dragCancelClassName,
      dragHandleClassName,
      updateToRemote,
      boundaryClassName,
      updateZIndexToRemote,
    } = tsw;

    const [controlled, setControlled] = useState(() => tsw.controlled);

    useEffect(() => {
      const handleChange = (controlled: boolean) => {
        setControlled(controlled);
      };
      if (tsw.addControlStateListener) {
        tsw.addControlStateListener(handleChange);
      }

      return () => {
        if (tsw.removeControlStateListener) {
          tsw.removeControlStateListener(handleChange);
        }
      };
    }, []);

    const handleZIndexUpdate = () => updateZIndexToRemote(widget.latestZIndex);

    return (
      <TrackCore
        key={widget.widgetId}
        minHeight={minHeight}
        minWidth={minWidth}
        draggable={draggable}
        resizable={resizable}
        controlled={controlled}
        cancel={dragCancelClassName}
        handle={dragHandleClassName}
        boundaryName={boundaryClassName}
        track={track!}
        zIndex={zIndex}
        onChange={updateToRemote}
        onZIndexChange={handleZIndexUpdate}>
        {children}
      </TrackCore>
    );
  },
);
