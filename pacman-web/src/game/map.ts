import mapText from '../assets/new-map.txt?raw';

export type TileCode = string;

export interface ParsedMap {
  readonly width: number;
  readonly height: number;
  readonly tiles: TileCode[][];
}

const TILE_SEPARATOR = '\n';

export function parseMap(): ParsedMap {
  const rows = mapText
    .trim()
    .split(TILE_SEPARATOR)
    .map((row) => row.split(''));

  const height = rows.length;
  const width = rows[0]?.length ?? 0;

  return {
    width,
    height,
    tiles: rows,
  };
}
