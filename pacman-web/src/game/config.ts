import rawConfig from '../assets/config.json';

export interface GhostModeLengths {
  chase: number;
  scatter: number;
  frightened: number;
}

export interface GhostSpeeds {
  chase: number;
  scatter: number;
  frightened: number;
}

export interface LevelDefinition {
  levelNo: number;
  pacmanSpeed: number;
  ghostSpeed: GhostSpeeds;
  modeLengths: GhostModeLengths;
}

export interface GameDefinition {
  map: string;
  numLives: number;
  levels: LevelDefinition[];
}

export const gameDefinition = rawConfig as GameDefinition;
