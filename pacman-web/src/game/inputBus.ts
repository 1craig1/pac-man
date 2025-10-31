import Phaser from 'phaser';

export type InputDirection = 'left' | 'right' | 'up' | 'down';

export const inputBus = new Phaser.Events.EventEmitter();
