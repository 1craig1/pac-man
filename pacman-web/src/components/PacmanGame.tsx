import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { createPacmanGame } from '../game/createGame';
import { gameDefinition } from '../game/config';
import { TouchControls } from './TouchControls';

export function PacmanGame(): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const game = createPacmanGame(containerRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  const [firstLevel] = gameDefinition.levels;

  return (
    <section className="game-shell">
      <header className="game-shell__header">
        <h1>Pac-Man Web Prototype</h1>
        <p>
          Lives: <strong>{gameDefinition.numLives}</strong> · Pac-Man speed:{' '}
          <strong>{firstLevel.pacmanSpeed}</strong>
        </p>
      </header>
      <div ref={containerRef} className="game-shell__stage" />
      <TouchControls />
      <footer className="game-shell__footer">
        <p>Level 1 ghost chase/scatter/frightened durations (s):</p>
        <ul>
          <li>Chase: {firstLevel.modeLengths.chase}</li>
          <li>Scatter: {firstLevel.modeLengths.scatter}</li>
          <li>Frightened: {firstLevel.modeLengths.frightened}</li>
        </ul>
      </footer>
    </section>
  );
}
