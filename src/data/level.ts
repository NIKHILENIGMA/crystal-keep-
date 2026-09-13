export interface Waypoint {
  x: number;
  y: number;
}

export interface LevelData {
  path: Waypoint[];
}

export const level1: LevelData = {
  path: [
    { x: 76, y: -20 }, // Enemy spawn
    { x: 82, y: 40 },
    { x: 94, y: 85 },
    { x: 118, y: 125 },
    { x: 158, y: 152 },
    { x: 214, y: 162 },
    { x: 300, y: 169 },
    { x: 355, y: 180 },
    { x: 390, y: 244 },
    { x: 420, y: 280 },
    { x: 430, y: 286 },
    { x: 495, y: 292 },
    { x: 525, y: 298 },
    { x: 585, y: 360 },
    { x: 690, y: 498 },
  ],
};
