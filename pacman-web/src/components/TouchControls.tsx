import { memo } from 'react';
import type { ReactElement, PointerEvent } from 'react';
import { inputBus, type InputDirection } from '../game/inputBus';

function emitDirection(direction: InputDirection) {
  inputBus.emit('direction', direction);
}

function handlePointer(direction: InputDirection) {
  return (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    emitDirection(direction);
  };
}

export const TouchControls = memo(function TouchControls(): ReactElement {
  return (
    <div className="touch-controls" aria-label="Touch movement controls">
      <button
        className="touch-controls__button touch-controls__button--up"
        type="button"
        onPointerDown={handlePointer('up')}
      >
        ▲
      </button>
      <button
        className="touch-controls__button touch-controls__button--left"
        type="button"
        onPointerDown={handlePointer('left')}
      >
        ◀
      </button>
      <button
        className="touch-controls__button touch-controls__button--down"
        type="button"
        onPointerDown={handlePointer('down')}
      >
        ▼
      </button>
      <button
        className="touch-controls__button touch-controls__button--right"
        type="button"
        onPointerDown={handlePointer('right')}
      >
        ▶
      </button>
    </div>
  );
});
