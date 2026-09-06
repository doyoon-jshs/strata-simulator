export const BOUNDS = {
  minX: -4,
  maxX: 4,
  minZ: -3,
  maxZ: 3,
  bottom: -2.15,
  top: 1.65,
} as const;

export const LAYERS = [
  { name: '사암층 A', short: 'A', color: '#e5bd63', dark: '#b98b36' },
  { name: '셰일층 B', short: 'B', color: '#c97856', dark: '#92503c' },
  { name: '석회암층 C', short: 'C', color: '#91a982', dark: '#607957' },
  { name: '응회암층 D', short: 'D', color: '#6f93a0', dark: '#466a77' },
  { name: '기반암 E', short: 'E', color: '#475f6a', dark: '#2d4149' },
] as const;

// 경계값의 차이는 지층의 실제 두께에 해당한다. 화면의 1단위는 약 100 m이다.
export const LAYER_BOUNDARIES = [1.42, 0.79, 0.16, -0.47] as const;

export const TERRAIN_PRESETS = [
  { id: 'ridge-valley', label: '능선·계곡' },
  { id: 'conical-hill', label: '원추형 산지' },
  { id: 'saddle', label: '안부' },
  { id: 'dissected', label: '침식 산지' },
] as const;

export type TerrainPreset = (typeof TERRAIN_PRESETS)[number]['id'];

function hill(x: number, z: number, centerX: number, centerZ: number, widthX: number, widthZ: number) {
  return Math.exp(-(((x - centerX) / widthX) ** 2 + ((z - centerZ) / widthZ) ** 2));
}

export function surfaceHeight(x: number, z: number, terrain: TerrainPreset = 'ridge-valley') {
  if (terrain === 'conical-hill') {
    return 0.16 + 1.18 * hill(x, z, 0.25, -0.1, 2.35, 2.05) + 0.045 * Math.sin(x * 1.25);
  }

  if (terrain === 'saddle') {
    const westPeak = 0.88 * hill(x, z, -1.7, 0, 1.45, 1.65);
    const eastPeak = 0.88 * hill(x, z, 1.7, 0, 1.45, 1.65);
    return 0.18 + westPeak + eastPeak + 0.055 * Math.cos(z * 1.45);
  }

  if (terrain === 'dissected') {
    const upland = 0.82 * hill(x, z, 0.35, -0.15, 3.6, 3.0);
    const mainValley = 0.34 * Math.exp(-((x - 0.52 * z + 0.85) ** 2) / 0.3);
    const branchValley = 0.22 * Math.exp(-((x + 0.68 * z - 1.5) ** 2) / 0.24);
    return 0.27 + upland - mainValley - branchValley + 0.045 * Math.sin(z * 1.7);
  }

  const diagonalRidge = 0.68 * Math.exp(-((x + 0.42 * z - 0.15) ** 2) / 2.6);
  const windingValley = 0.34 * Math.exp(-((x - 0.28 * z + 1.75) ** 2) / 0.42);
  return 0.3 + 0.075 * z + diagonalRidge - windingValley + 0.055 * Math.sin(z * 1.55);
}

/** 같은 값인 점들이 하나의 지층 경계면을 이루는 법선 방향 좌표. */
export function stratigraphicCoordinate(
  x: number,
  y: number,
  z: number,
  strike: number,
  dip: number,
) {
  const dipRadians = (dip * Math.PI) / 180;
  const dipDirection = ((strike + 90) * Math.PI) / 180;
  const downDipDistance = x * Math.sin(dipDirection) + z * Math.cos(dipDirection);
  return y * Math.cos(dipRadians) + downDipDistance * Math.sin(dipRadians);
}

export function layerIndexAt(
  x: number,
  y: number,
  z: number,
  strike: number,
  dip: number,
) {
  const coordinate = stratigraphicCoordinate(x, y, z, strike, dip);
  for (let index = 0; index < LAYER_BOUNDARIES.length; index += 1) {
    if (coordinate >= LAYER_BOUNDARIES[index]) return index;
  }
  return LAYERS.length - 1;
}

export function formatStrike(strike: number) {
  const normalized = ((strike % 180) + 180) % 180;
  return normalized <= 90
    ? `N${Math.round(normalized)}°E`
    : `N${Math.round(180 - normalized)}°W`;
}

export function formatDipDirection(strike: number) {
  const direction = (strike + 90) % 360;
  if (direction >= 45 && direction < 135) return 'SE';
  if (direction >= 135 && direction < 225) return 'SW';
  if (direction >= 225 && direction < 315) return 'NW';
  return 'NE';
}

export function worldToMap(z: number, height: number) {
  return ((BOUNDS.maxZ - z) / (BOUNDS.maxZ - BOUNDS.minZ)) * height;
}

export function mapToWorldZ(y: number, height: number) {
  return BOUNDS.maxZ - (y / height) * (BOUNDS.maxZ - BOUNDS.minZ);
}
