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

export function surfaceHeight(x: number, z: number) {
  const broadHill = 0.48 * Math.exp(-((x - 1.1) ** 2 + (z + 0.2) ** 2) / 6.4);
  const smallHill = 0.2 * Math.exp(-((x + 2.25) ** 2 + (z - 1.15) ** 2) / 2.2);
  return (
    0.62 + broadHill + smallHill + 0.12 * Math.sin(x * 0.92) +
    0.1 * Math.cos(z * 1.18) + 0.05 * Math.sin((x + z) * 1.6)
  );
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
