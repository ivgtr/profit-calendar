import { ReactNode } from 'react';

interface GlobalDragOverlayProps {
  visible: boolean;
  message: string;
  icon?: ReactNode;
}

export function GlobalDragOverlay({ visible, message, icon }: GlobalDragOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="global-dnd-overlay">
      <div className="global-dnd-overlay__content">
        {icon ? <div className="global-dnd-overlay__icon">{icon}</div> : null}
        <p className="global-dnd-overlay__text">{message}</p>
      </div>
    </div>
  );
}
