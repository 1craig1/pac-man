import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { TILE_SIZE } from './constants';
import { parseMap } from './map';

export function createPacmanGame(parent: HTMLDivElement): Phaser.Game {
  const { width, height } = parseMap();

  return new Phaser.Game({
    type: Phaser.AUTO,
    width: width * TILE_SIZE,
    height: height * TILE_SIZE + 64,
    parent,
    backgroundColor: '#000000',
    scene: [GameScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
