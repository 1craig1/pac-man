import Phaser from 'phaser';
import type { ParsedMap, TileCode } from './map';
import { parseMap } from './map';
import { gameDefinition, type LevelDefinition } from './config';
import { TILE_SIZE } from './constants';
import { inputBus, type InputDirection } from './inputBus';
import pelletImageUrl from '../assets/maze/pellet.png';
import pacmanRightImageUrl from '../assets/maze/pacman/playerRight.png';
import pacmanLeftImageUrl from '../assets/maze/pacman/playerLeft.png';
import pacmanUpImageUrl from '../assets/maze/pacman/playerUp.png';
import pacmanDownImageUrl from '../assets/maze/pacman/playerDown.png';
import pacmanClosedImageUrl from '../assets/maze/pacman/playerClosed.png';
import blinkyImageUrl from '../assets/maze/ghosts/blinky.png';
import pinkyImageUrl from '../assets/maze/ghosts/pinky.png';
import inkyImageUrl from '../assets/maze/ghosts/inky.png';
import clydeImageUrl from '../assets/maze/ghosts/clyde.png';
import frightenedGhostImageUrl from '../assets/maze/ghosts/frightened.png';

const WALL_TILES = new Set(['1', '2', '3', '4', '5', '6']);
const PASSABLE_TILES = new Set(['0', '7', 'z', 'p', 'b', 's', 'i', 'c']);

const PELLET_POINTS = 10;
const POWER_PELLET_POINTS = 50;
const GHOST_BASE_POINTS = 200;

const POWER_PELLET_SCALE = 0.95;

const PACMAN_SPEED_MULTIPLIER = 2;
const GHOST_SPEED_MULTIPLIER = 2;

const GHOST_TEXTURE_KEYS = {
  b: 'blinky',
  s: 'pinky',
  i: 'inky',
  c: 'clyde',
} as const;

type GhostId = keyof typeof GHOST_TEXTURE_KEYS;
type Direction = 'left' | 'right' | 'up' | 'down';
type GhostMode = 'scatter' | 'chase' | 'frightened';
type BaseGhostMode = 'scatter' | 'chase';
type GamePhase = 'ready' | 'inProgress' | 'levelClear' | 'gameOver';
type ModeScheduleEntry = { mode: BaseGhostMode; duration: number };

const DIRECTION_VECTORS: Record<Direction, Phaser.Math.Vector2> = {
  left: new Phaser.Math.Vector2(-1, 0),
  right: new Phaser.Math.Vector2(1, 0),
  up: new Phaser.Math.Vector2(0, -1),
  down: new Phaser.Math.Vector2(0, 1),
};

function isPellet(tile: TileCode): boolean {
  return tile === '7';
}

function isPowerPellet(tile: TileCode): boolean {
  return tile === 'z';
}

function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'up':
      return 'down';
    case 'down':
      return 'up';
  }
}

function isGhostTile(tile: TileCode): tile is GhostId {
  return tile === 'b' || tile === 's' || tile === 'i' || tile === 'c';
}

interface PacmanSprites {
  readonly right: string;
  readonly left: string;
  readonly up: string;
  readonly down: string;
  readonly closed: string;
}

const PACMAN_SPRITES: PacmanSprites = {
  right: 'pacman-right',
  left: 'pacman-left',
  up: 'pacman-up',
  down: 'pacman-down',
  closed: 'pacman-closed',
};

interface GhostEntity {
  readonly id: GhostId;
  readonly spawn: Phaser.Math.Vector2;
  sprite: Phaser.GameObjects.Image;
  direction: Direction | null;
  speed: number;
  mode: GhostMode;
  textureKey: string;
  respawnTimer: number;
}

interface SceneInitData {
  levelIndex?: number;
  score?: number;
  lives?: number;
}

export class GameScene extends Phaser.Scene {
  private parsedMap!: ParsedMap;
  private levelDefinition!: LevelDefinition;

  private pacman!: Phaser.GameObjects.Image;
  private pacmanSpawn!: Phaser.Math.Vector2;
  private pacmanDirection: Direction | null = null;
  private lastPacmanDirection: Direction = 'left';
  private queuedDirection: Direction | null = null;
  private pacmanSprites: PacmanSprites = PACMAN_SPRITES;
  private timeSinceLastMunch = 0;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private pellets = new Map<string, Phaser.GameObjects.Image>();
  private ghosts: GhostEntity[] = [];

  private scatterTargets!: Record<GhostId, Phaser.Math.Vector2>;

  private modeSchedule: ModeScheduleEntry[] = [];
  private modeScheduleIndex = 0;

  private score = 0;
  private lives = gameDefinition.numLives;
  private levelIndex = 0;

  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private hudTextCache = '';

  private gamePhase: GamePhase = 'ready';
  private readyTimer = 0;
  private levelClearTimer = 0;

  private baseGhostMode: BaseGhostMode = 'scatter';
  private ghostModeTimer = 0;
  private frightenedTimer = 0;
  private frightenedMultiplier = 0;

  constructor() {
    super('game');
  }

  preload(): void {
    this.load.image('pellet', pelletImageUrl);

    this.load.image(this.pacmanSprites.right, pacmanRightImageUrl);
    this.load.image(this.pacmanSprites.left, pacmanLeftImageUrl);
    this.load.image(this.pacmanSprites.up, pacmanUpImageUrl);
    this.load.image(this.pacmanSprites.down, pacmanDownImageUrl);
    this.load.image(this.pacmanSprites.closed, pacmanClosedImageUrl);

    this.load.image(GHOST_TEXTURE_KEYS.b, blinkyImageUrl);
    this.load.image(GHOST_TEXTURE_KEYS.s, pinkyImageUrl);
    this.load.image(GHOST_TEXTURE_KEYS.i, inkyImageUrl);
    this.load.image(GHOST_TEXTURE_KEYS.c, clydeImageUrl);
    this.load.image('ghost-frightened', frightenedGhostImageUrl);
  }

  create(data?: SceneInitData): void {
    const initData = data ?? {};
    this.levelIndex = initData.levelIndex ?? 0;
    this.score = initData.score ?? 0;
    this.lives = initData.lives ?? gameDefinition.numLives;

    this.levelDefinition = gameDefinition.levels[this.levelIndex];
    this.parsedMap = parseMap();
    this.scatterTargets = this.createScatterTargets();

    this.cameras.main.setBackgroundColor('#000000');

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input plugin not available');
    }
    this.cursors = keyboard.createCursorKeys();

    this.initializeEntities();
    this.createHud();

    inputBus.on('direction', this.handleExternalDirection, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      inputBus.off('direction', this.handleExternalDirection, this);
    });

    this.updateHud();
    this.startReadyPhase(2);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    switch (this.gamePhase) {
      case 'ready':
        this.readyTimer = Math.max(0, this.readyTimer - deltaSeconds);
        if (this.readyTimer === 0) {
          this.beginInProgressPhase();
        }
        this.updateHud();
        return;
      case 'levelClear':
        this.levelClearTimer = Math.max(0, this.levelClearTimer - deltaSeconds);
        if (this.levelClearTimer === 0) {
          this.advanceToNextLevel();
        }
        this.updateHud();
        return;
      case 'gameOver':
        this.updateHud();
        return;
      case 'inProgress':
        break;
    }

    if (this.frightenedTimer > 0) {
      this.frightenedTimer = Math.max(0, this.frightenedTimer - deltaSeconds);
      if (this.frightenedTimer === 0) {
        this.endFrightenedMode();
      }
    } else {
      this.updateBaseGhostMode(deltaSeconds);
    }

    this.handleInput();
    this.updatePacman(deltaSeconds);
    this.handlePelletCollection();
    this.updateGhosts(deltaSeconds);
    this.checkGhostCollisions();

    if (this.pellets.size === 0) {
      this.handleLevelCleared();
    }

    this.updateHud();
  }

  private initializeEntities(): void {
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x1b3564, 1);
    const pelletLayer = this.add.layer();

    this.pellets = new Map();
    this.ghosts = [];

    this.parsedMap.tiles.forEach((row, rowIndex) => {
      row.forEach((tile, columnIndex) => {
        const x = columnIndex * TILE_SIZE;
        const y = rowIndex * TILE_SIZE;

        if (WALL_TILES.has(tile)) {
          wallGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          return;
        }

        if (tile === 'p') {
          this.pacmanSpawn = new Phaser.Math.Vector2(
            x + TILE_SIZE / 2,
            y + TILE_SIZE / 2
          );
          this.parsedMap.tiles[rowIndex][columnIndex] = '0';
          return;
        }

        if (isPellet(tile)) {
          const pellet = this.add
            .image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'pellet')
            .setDisplaySize(6, 6)
            .setName('pellet');
          pelletLayer.add(pellet);
          this.pellets.set(this.getTileKey(columnIndex, rowIndex), pellet);
        } else if (isPowerPellet(tile)) {
          const powerPellet = this.add
            .image(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'pellet')
            .setDisplaySize(TILE_SIZE * POWER_PELLET_SCALE, TILE_SIZE * POWER_PELLET_SCALE)
            .setTint(0xffcc00)
            .setName('powerPellet');
          pelletLayer.add(powerPellet);
          this.pellets.set(this.getTileKey(columnIndex, rowIndex), powerPellet);
        } else if (isGhostTile(tile)) {
          this.spawnGhost(tile, columnIndex, rowIndex, x, y);
        }
      });
    });

    this.pacman = this.add
      .image(this.pacmanSpawn.x, this.pacmanSpawn.y, this.pacmanSprites.right)
      .setDisplaySize(TILE_SIZE, TILE_SIZE)
      .setOrigin(0.5, 0.5);
  }

  private createHud(): void {
    const hudY = this.parsedMap.height * TILE_SIZE + 12;

    this.hudText = this.add.text(10, hudY, '', {
      color: '#ffffff',
      fontSize: '14px',
    });

    this.messageText = this.add
      .text(
        (this.parsedMap.width * TILE_SIZE) / 2,
        hudY,
        '',
        {
          color: '#ffd369',
          fontSize: '14px',
          align: 'center',
        }
      )
      .setOrigin(0.5, 0)
      .setPadding(0, 18, 0, 0);
  }

  private startReadyPhase(delaySeconds: number): void {
    this.gamePhase = 'ready';
    this.readyTimer = delaySeconds;
    this.showMessage('READY!');

    this.pacmanDirection = null;
    this.queuedDirection = null;
    this.timeSinceLastMunch = 0;
    this.lastPacmanDirection = 'left';
    this.pacman.setTexture(this.pacmanSprites.right);
    this.pacman.setPosition(this.pacmanSpawn.x, this.pacmanSpawn.y);
    this.alignEntityToGrid(this.pacman, null);

    this.frightenedTimer = 0;
    this.frightenedMultiplier = 0;

    this.modeSchedule = this.createModeSchedule(this.levelIndex + 1);
    this.modeScheduleIndex = 0;
    const initialMode = this.modeSchedule[0] ?? { mode: 'scatter', duration: Number.POSITIVE_INFINITY };
    this.baseGhostMode = initialMode.mode;
    this.ghostModeTimer = initialMode.duration;
    if (!Number.isFinite(this.ghostModeTimer)) {
      this.ghostModeTimer = Number.POSITIVE_INFINITY;
    }

    for (const ghost of this.ghosts) {
      ghost.sprite.setPosition(ghost.spawn.x, ghost.spawn.y);
      ghost.direction = 'left';
      ghost.respawnTimer = 0;
      this.applyGhostMode(ghost, this.baseGhostMode);
    }
  }

  private beginInProgressPhase(): void {
    this.gamePhase = 'inProgress';
    this.showMessage('');

    for (const ghost of this.ghosts) {
      if (ghost.respawnTimer === 0) {
        this.applyGhostMode(ghost, this.baseGhostMode);
      }
    }
  }

  private advanceToNextLevel(): void {
    const nextIndex = this.levelIndex + 1;
    if (nextIndex >= gameDefinition.levels.length) {
      this.showMessage('YOU WIN!');
      this.gamePhase = 'gameOver';
      return;
    }

    this.scene.start('game', {
      levelIndex: nextIndex,
      score: this.score,
      lives: this.lives,
    } satisfies SceneInitData);
  }

  private updateBaseGhostMode(deltaSeconds: number): void {
    if (!Number.isFinite(this.ghostModeTimer)) {
      return;
    }

    this.ghostModeTimer = Math.max(0, this.ghostModeTimer - deltaSeconds);
    if (this.ghostModeTimer === 0) {
      if (this.modeScheduleIndex < this.modeSchedule.length - 1) {
        this.modeScheduleIndex += 1;
      }

      const entry = this.modeSchedule[this.modeScheduleIndex];
      this.baseGhostMode = entry.mode;
      this.ghostModeTimer = entry.duration;
      if (!Number.isFinite(this.ghostModeTimer)) {
        this.ghostModeTimer = Number.POSITIVE_INFINITY;
      }

      for (const ghost of this.ghosts) {
        if (ghost.respawnTimer === 0 && ghost.mode !== 'frightened') {
          this.applyGhostMode(ghost, this.baseGhostMode);
        }
      }
    }
  }

  private handleInput(): void {
    if (this.cursors.left?.isDown) {
      this.queuedDirection = 'left';
    } else if (this.cursors.right?.isDown) {
      this.queuedDirection = 'right';
    } else if (this.cursors.up?.isDown) {
      this.queuedDirection = 'up';
    } else if (this.cursors.down?.isDown) {
      this.queuedDirection = 'down';
    }
  }

  private handleExternalDirection(direction: InputDirection): void {
    this.queuedDirection = direction;
  }

  private updatePacman(deltaSeconds: number): void {
    const pixelsPerSecond = this.levelDefinition.pacmanSpeed * TILE_SIZE * PACMAN_SPEED_MULTIPLIER;

    const desiredDirection = this.queuedDirection ?? this.pacmanDirection;
    if (desiredDirection && this.canPacmanMove(desiredDirection)) {
      if (this.pacmanDirection !== desiredDirection) {
        this.switchPacmanSprite(desiredDirection);
      }
      this.pacmanDirection = desiredDirection;
      this.lastPacmanDirection = desiredDirection;
    } else if (this.pacmanDirection && !this.canPacmanMove(this.pacmanDirection)) {
      this.pacmanDirection = null;
    }

    if (!this.pacmanDirection) {
      this.animateMouth(deltaSeconds, true);
      return;
    }

    const vector = DIRECTION_VECTORS[this.pacmanDirection];
    this.pacman.x += vector.x * pixelsPerSecond * deltaSeconds;
    this.pacman.y += vector.y * pixelsPerSecond * deltaSeconds;

    this.keepEntityInsideBounds(this.pacman);
    this.alignEntityToGrid(this.pacman, this.pacmanDirection);
    this.animateMouth(deltaSeconds, false);
  }

  private canPacmanMove(direction: Direction): boolean {
    if (!this.isEntityNearTileCenter(this.pacman)) {
      return this.pacmanDirection === direction;
    }

    const pacTile = this.getTilePositionFromCoordinates(this.pacman.x, this.pacman.y);
    const vector = DIRECTION_VECTORS[direction];
    const nextTile = pacTile.clone().add(vector);

    if (!this.isWithinBounds(nextTile.x, nextTile.y)) {
      return false;
    }

    const tile = this.parsedMap.tiles[nextTile.y][nextTile.x];
    return PASSABLE_TILES.has(tile);
  }

  private animateMouth(deltaSeconds: number, idle: boolean): void {
    const animationInterval = idle ? 0.3 : 0.15;
    this.timeSinceLastMunch += deltaSeconds;

    if (this.timeSinceLastMunch >= animationInterval) {
      const currentTexture = this.pacman.texture.key;
      if (currentTexture === this.pacmanSprites.closed) {
        const texture = this.pacmanDirection
          ? this.getSpriteForDirection(this.pacmanDirection)
          : this.getSpriteForDirection(this.lastPacmanDirection);
        this.pacman.setTexture(texture);
      } else {
        this.pacman.setTexture(this.pacmanSprites.closed);
      }
      this.timeSinceLastMunch = 0;
    }
  }

  private updateGhosts(deltaSeconds: number): void {
    for (const ghost of this.ghosts) {
      if (ghost.respawnTimer > 0) {
        ghost.respawnTimer = Math.max(0, ghost.respawnTimer - deltaSeconds);
        if (ghost.respawnTimer === 0) {
          ghost.sprite.setPosition(ghost.spawn.x, ghost.spawn.y);
          ghost.sprite.setVisible(true);
          ghost.direction = 'left';
          this.applyGhostMode(ghost, this.baseGhostMode);
        }
        continue;
      }

      const sprite = ghost.sprite;

      if (this.isEntityNearTileCenter(sprite)) {
        const tilePosition = this.getTilePositionFromCoordinates(sprite.x, sprite.y);
        let possibleDirections = this.getAvailableDirections(tilePosition.x, tilePosition.y);

        if (ghost.direction) {
          const opposite = getOppositeDirection(ghost.direction);
          if (possibleDirections.length > 1) {
            possibleDirections = possibleDirections.filter((dir) => dir !== opposite);
          }
        }

        if (possibleDirections.length > 0) {
          if (ghost.mode === 'frightened') {
            ghost.direction = Phaser.Utils.Array.GetRandom(possibleDirections);
          } else {
            const target = this.getGhostTargetTile(ghost);
            let bestDirection: Direction | null = null;
            let shortestDistance = Number.POSITIVE_INFINITY;

            for (const direction of possibleDirections) {
              const vector = DIRECTION_VECTORS[direction];
              const candidateTile = tilePosition.clone().add(vector);
              const dx = candidateTile.x - target.x;
              const dy = candidateTile.y - target.y;
              const distance = dx * dx + dy * dy;

              if (distance < shortestDistance) {
                bestDirection = direction;
                shortestDistance = distance;
              }
            }

            if (bestDirection) {
              ghost.direction = bestDirection;
            }
          }
        }
      }

      if (!ghost.direction) {
        continue;
      }

      const vector = DIRECTION_VECTORS[ghost.direction];
      sprite.x += vector.x * ghost.speed * deltaSeconds;
      sprite.y += vector.y * ghost.speed * deltaSeconds;

      this.keepEntityInsideBounds(sprite);
      this.alignEntityToGrid(sprite, ghost.direction);
    }
  }

  private handlePelletCollection(): void {
    const pacTile = this.getTilePositionFromCoordinates(this.pacman.x, this.pacman.y);
    if (!this.isWithinBounds(pacTile.x, pacTile.y)) {
      return;
    }

    const tile = this.parsedMap.tiles[pacTile.y][pacTile.x];
    if (tile !== '7' && tile !== 'z') {
      return;
    }

    const key = this.getTileKey(pacTile.x, pacTile.y);
    const pelletSprite = this.pellets.get(key);
    if (pelletSprite) {
      pelletSprite.destroy();
      this.pellets.delete(key);
    }

    this.parsedMap.tiles[pacTile.y][pacTile.x] = '0';

    const points = tile === 'z' ? POWER_PELLET_POINTS : PELLET_POINTS;
    this.incrementScore(points);

    if (tile === 'z') {
      this.activateFrightenedMode();
    }
  }

  private checkGhostCollisions(): void {
    for (const ghost of this.ghosts) {
      if (ghost.respawnTimer > 0) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        ghost.sprite.x,
        ghost.sprite.y,
        this.pacman.x,
        this.pacman.y
      );

      if (distance > TILE_SIZE * 0.6) {
        continue;
      }

      if (ghost.mode === 'frightened') {
        this.handleGhostEaten(ghost);
      } else {
        this.handlePacmanHit();
        break;
      }
    }
  }

  private handlePacmanHit(): void {
    if (this.gamePhase === 'gameOver') {
      return;
    }

    this.lives -= 1;
    this.updateHud();

    if (this.lives <= 0) {
      this.gamePhase = 'gameOver';
      this.showMessage('GAME OVER');
      return;
    }

    this.startReadyPhase(2);
  }

  private handleLevelCleared(): void {
    if (this.gamePhase !== 'inProgress') {
      return;
    }

    this.gamePhase = 'levelClear';
    const isLastLevel = this.levelIndex + 1 >= gameDefinition.levels.length;
    this.showMessage(isLastLevel ? 'YOU WIN!' : 'LEVEL CLEARED!');
    this.levelClearTimer = 2.5;
  }

  private activateFrightenedMode(): void {
    this.frightenedTimer = this.levelDefinition.modeLengths.frightened;
    this.frightenedMultiplier = 0;

    for (const ghost of this.ghosts) {
      if (ghost.respawnTimer > 0) {
        continue;
      }
      this.applyGhostMode(ghost, 'frightened');
      ghost.direction = getOppositeDirection(ghost.direction ?? 'left');
    }
  }

  private endFrightenedMode(): void {
    this.frightenedTimer = 0;
    this.frightenedMultiplier = 0;

    for (const ghost of this.ghosts) {
      if (ghost.respawnTimer > 0) {
        continue;
      }
      this.applyGhostMode(ghost, this.baseGhostMode);
    }
  }

  private handleGhostEaten(ghost: GhostEntity): void {
    const points = GHOST_BASE_POINTS * 2 ** this.frightenedMultiplier;
    this.frightenedMultiplier += 1;
    this.incrementScore(points);

    ghost.respawnTimer = 1;
    ghost.sprite.setVisible(false);
    ghost.direction = null;
    ghost.sprite.setPosition(-TILE_SIZE, -TILE_SIZE);
  }

  private applyGhostMode(ghost: GhostEntity, mode: GhostMode | BaseGhostMode): void {
    switch (mode) {
      case 'frightened':
        ghost.mode = 'frightened';
        ghost.speed = this.levelDefinition.ghostSpeed.frightened * TILE_SIZE * GHOST_SPEED_MULTIPLIER;
        ghost.sprite.setTexture('ghost-frightened');
        break;
      case 'chase':
        ghost.mode = 'chase';
        ghost.speed = this.levelDefinition.ghostSpeed.chase * TILE_SIZE * GHOST_SPEED_MULTIPLIER;
        ghost.sprite.setTexture(ghost.textureKey);
        break;
      case 'scatter':
      default:
        ghost.mode = 'scatter';
        ghost.speed = this.levelDefinition.ghostSpeed.scatter * TILE_SIZE * GHOST_SPEED_MULTIPLIER;
        ghost.sprite.setTexture(ghost.textureKey);
        break;
    }
  }

  private incrementScore(amount: number): void {
    this.score += amount;
    this.hudTextCache = '';
  }

  private updateHud(): void {
    const frightenedActive = this.frightenedTimer > 0;
    const frightenedInfo = frightenedActive
      ? `    Fright: ${this.frightenedTimer.toFixed(1)}s ×${2 ** this.frightenedMultiplier}`
      : '';
    const text = `Score: ${this.score}    Lives: ${this.lives}    Level: ${
      this.levelIndex + 1
    }${frightenedInfo}`;

    if (text !== this.hudTextCache) {
      this.hudText.setText(text);
      this.hudTextCache = text;
    }
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
  }

  private spawnGhost(
    tile: GhostId,
    columnIndex: number,
    rowIndex: number,
    x: number,
    y: number
  ): void {
    const spriteCenterX = x + TILE_SIZE / 2;
    const spriteCenterY = y + TILE_SIZE / 2;

    const textureKey = GHOST_TEXTURE_KEYS[tile];
    const sprite = this.add
      .image(spriteCenterX, spriteCenterY, textureKey)
      .setDisplaySize(TILE_SIZE, TILE_SIZE)
      .setOrigin(0.5, 0.5);

    const speed = this.levelDefinition.ghostSpeed.scatter * TILE_SIZE * GHOST_SPEED_MULTIPLIER;

    this.ghosts.push({
      id: tile,
      sprite,
      direction: 'left',
      spawn: new Phaser.Math.Vector2(spriteCenterX, spriteCenterY),
      speed,
      mode: 'scatter',
      textureKey,
      respawnTimer: 0,
    });

    this.parsedMap.tiles[rowIndex][columnIndex] = '0';
  }

  private keepEntityInsideBounds(entity: Phaser.GameObjects.Image): void {
    const min = TILE_SIZE / 2;
    const maxX = this.parsedMap.width * TILE_SIZE - TILE_SIZE / 2;
    const maxY = this.parsedMap.height * TILE_SIZE - TILE_SIZE / 2;

    entity.x = Phaser.Math.Clamp(entity.x, min, maxX);
    entity.y = Phaser.Math.Clamp(entity.y, min, maxY);
  }

  private alignEntityToGrid(entity: Phaser.GameObjects.Image, direction: Direction | null): void {
    const centerX = (Math.floor(entity.x / TILE_SIZE) + 0.5) * TILE_SIZE;
    const centerY = (Math.floor(entity.y / TILE_SIZE) + 0.5) * TILE_SIZE;

    if (direction === 'left' || direction === 'right') {
      if (Math.abs(entity.y - centerY) <= 1.2) {
        entity.y = centerY;
      }
    } else if (direction === 'up' || direction === 'down') {
      if (Math.abs(entity.x - centerX) <= 1.2) {
        entity.x = centerX;
      }
    }
  }

  private isEntityNearTileCenter(entity: Phaser.GameObjects.Image): boolean {
    const tileCenterX = (Math.floor(entity.x / TILE_SIZE) + 0.5) * TILE_SIZE;
    const tileCenterY = (Math.floor(entity.y / TILE_SIZE) + 0.5) * TILE_SIZE;
    const threshold = 2;
    return (
      Math.abs(entity.x - tileCenterX) <= threshold &&
      Math.abs(entity.y - tileCenterY) <= threshold
    );
  }

  private getTilePositionFromCoordinates(x: number, y: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.floor(x / TILE_SIZE),
      Math.floor(y / TILE_SIZE)
    );
  }

  private getAvailableDirections(tileX: number, tileY: number): Direction[] {
    const directions: Direction[] = [];

    if (this.isWithinBounds(tileX, tileY - 1) && PASSABLE_TILES.has(this.parsedMap.tiles[tileY - 1][tileX])) {
      directions.push('up');
    }
    if (this.isWithinBounds(tileX, tileY + 1) && PASSABLE_TILES.has(this.parsedMap.tiles[tileY + 1][tileX])) {
      directions.push('down');
    }
    if (this.isWithinBounds(tileX - 1, tileY) && PASSABLE_TILES.has(this.parsedMap.tiles[tileY][tileX - 1])) {
      directions.push('left');
    }
    if (this.isWithinBounds(tileX + 1, tileY) && PASSABLE_TILES.has(this.parsedMap.tiles[tileY][tileX + 1])) {
      directions.push('right');
    }

    return directions;
  }

  private isWithinBounds(tileX: number, tileY: number): boolean {
    return tileX >= 0 && tileX < this.parsedMap.width && tileY >= 0 && tileY < this.parsedMap.height;
  }

  private getTileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private switchPacmanSprite(direction: Direction): void {
    this.pacman.setTexture(this.getSpriteForDirection(direction));
  }

  private getSpriteForDirection(direction: Direction): string {
    switch (direction) {
      case 'left':
        return this.pacmanSprites.left;
      case 'right':
        return this.pacmanSprites.right;
      case 'up':
        return this.pacmanSprites.up;
      case 'down':
        return this.pacmanSprites.down;
    }
  }

  private getPacmanDirectionVector(): Phaser.Math.Vector2 {
    const direction = this.pacmanDirection ?? this.lastPacmanDirection;
    const vector = DIRECTION_VECTORS[direction].clone();

    // Replicate classic bug: when facing up, target is offset left as well.
    if (direction === 'up') {
      vector.x = -1;
      vector.y = -1;
    }

    return vector;
  }

  private getGhostTargetTile(ghost: GhostEntity): Phaser.Math.Vector2 {
    if (ghost.mode === 'scatter') {
      return this.scatterTargets[ghost.id].clone();
    }

    const pacmanTile = this.getTilePositionFromCoordinates(this.pacman.x, this.pacman.y);

    switch (ghost.id) {
      case 'b':
        return this.clampTileVector(pacmanTile);
      case 's': {
    const directionVec = this.getPacmanDirectionVector();
        const target = pacmanTile.clone().add(directionVec.scale(4));
        return this.clampTileVector(target);
      }
      case 'i': {
        const directionVec = this.getPacmanDirectionVector();
        const twoAhead = pacmanTile.clone().add(directionVec.scale(2));
        const blinky = this.ghosts.find((g) => g.id === 'b');
        if (!blinky) {
          return this.clampTileVector(twoAhead);
        }
        const blinkyTile = this.getTilePositionFromCoordinates(blinky.sprite.x, blinky.sprite.y);
        const vector = twoAhead.clone().subtract(blinkyTile).scale(2);
        return this.clampTileVector(blinkyTile.clone().add(vector));
      }
      case 'c': {
        const ghostTile = this.getTilePositionFromCoordinates(ghost.sprite.x, ghost.sprite.y);
        const distanceToPacman = Phaser.Math.Distance.Between(
          ghostTile.x,
          ghostTile.y,
          pacmanTile.x,
          pacmanTile.y
        );
        if (distanceToPacman > 8) {
          return this.clampTileVector(pacmanTile);
        }
        return this.scatterTargets.c.clone();
      }
      default:
        return this.clampTileVector(pacmanTile);
    }
  }

  private clampTileVector(target: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    target.x = Phaser.Math.Clamp(target.x, 0, this.parsedMap.width - 1);
    target.y = Phaser.Math.Clamp(target.y, 0, this.parsedMap.height - 1);
    return target;
  }

  private createScatterTargets(): Record<GhostId, Phaser.Math.Vector2> {
    const maxX = this.parsedMap.width - 1;
    const maxY = this.parsedMap.height - 1;

    return {
      b: new Phaser.Math.Vector2(maxX - 1, 1),
      s: new Phaser.Math.Vector2(1, 1),
      i: new Phaser.Math.Vector2(maxX - 1, maxY - 1),
      c: new Phaser.Math.Vector2(1, maxY - 1),
    };
  }

  private createModeSchedule(levelNo: number): ModeScheduleEntry[] {
    const schedule: ModeScheduleEntry[] = [];
    const push = (mode: BaseGhostMode, duration: number) => {
      if (duration <= 0) {
        return;
      }
      schedule.push({ mode, duration });
    };

    if (levelNo === 1) {
      push('scatter', 7);
      push('chase', 20);
      push('scatter', 7);
      push('chase', 20);
      push('scatter', 5);
      push('chase', 20);
      push('scatter', 5);
    } else if (levelNo >= 2 && levelNo <= 4) {
      push('scatter', 7);
      push('chase', 20);
      push('scatter', 7);
      push('chase', 20);
      push('scatter', 5);
      push('chase', 20);
      push('scatter', 1);
    } else {
      push('scatter', 5);
      push('chase', 20);
      push('scatter', 5);
      push('chase', 20);
      push('scatter', 5);
    }

    schedule.push({ mode: 'chase', duration: Number.POSITIVE_INFINITY });
    return schedule;
  }
}
