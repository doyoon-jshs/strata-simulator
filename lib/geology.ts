export const BOUNDS = {
  minX: -4,
  maxX: 4,
  minZ: -3,
  maxZ: 3,
  bottom: -2.15,
  top: 1.65,
} as const;

export type GeologyLayer = {
  name: string;
  short: string;
  color: string;
  dark: string;
};

export const ROCK_SUITES = [
  { id: 'sedimentary', label: '퇴적암층' },
  { id: 'mixed', label: '혼합 지층' },
  { id: 'volcanic', label: '화산암층' },
] as const;

export type RockSuite = (typeof ROCK_SUITES)[number]['id'];

const ROCK_LIBRARY: Record<RockSuite, Array<Omit<GeologyLayer, 'name' | 'short'> & { rock: string }>> = {
  sedimentary: [
    { rock: '역암', color: '#d4a373', dark: '#9c6b42' },
    { rock: '사암', color: '#e5bd63', dark: '#b98b36' },
    { rock: '셰일', color: '#c97856', dark: '#92503c' },
    { rock: '석회암', color: '#91a982', dark: '#607957' },
    { rock: '이암', color: '#8da2b5', dark: '#5f7487' },
    { rock: '사암', color: '#d9a94f', dark: '#9f742e' },
    { rock: '셰일', color: '#a96f64', dark: '#75483f' },
  ],
  mixed: [
    { rock: '사암', color: '#e5bd63', dark: '#b98b36' },
    { rock: '셰일', color: '#c97856', dark: '#92503c' },
    { rock: '응회암', color: '#6f93a0', dark: '#466a77' },
    { rock: '석회암', color: '#91a982', dark: '#607957' },
    { rock: '역암', color: '#b98b6b', dark: '#805d45' },
    { rock: '현무암', color: '#59656f', dark: '#35414b' },
    { rock: '이암', color: '#9b8aa3', dark: '#6b5b73' },
  ],
  volcanic: [
    { rock: '응회암', color: '#80a6ad', dark: '#4f737a' },
    { rock: '현무암', color: '#59656f', dark: '#35414b' },
    { rock: '화산각력암', color: '#a87963', dark: '#76503f' },
    { rock: '유문암', color: '#c9a4b6', dark: '#916f80' },
    { rock: '응회암', color: '#7197a5', dark: '#466674' },
    { rock: '안산암', color: '#7f8790', dark: '#525b65' },
    { rock: '집괴암', color: '#b28a66', dark: '#7d6045' },
  ],
};

export function layersForSuite(suite: RockSuite, count: number): GeologyLayer[] {
  return ROCK_LIBRARY[suite].slice(0, count).map((layer, index) => ({
    ...layer,
    name: `${layer.rock}층 ${String.fromCharCode(65 + index)}`,
    short: String.fromCharCode(65 + index),
  }));
}

// 경계값의 차이는 지층의 실제 두께에 해당한다. 화면의 1단위는 약 100 m이다.
export function layerBoundaries(count: number, spacing: number) {
  const center = 0.475;
  return Array.from({ length: count - 1 }, (_, index) => center + ((count - 2) / 2 - index) * spacing);
}

export const LAYERS = layersForSuite('mixed', 5);
export const LAYER_BOUNDARIES = layerBoundaries(5, 0.63);

export const TERRAIN_PRESETS = [
  { id: 'ridge-valley', label: '능선·계곡' },
  { id: 'conical-hill', label: '원추형 산지' },
  { id: 'saddle', label: '안부' },
  { id: 'dissected', label: '침식 산지' },
] as const;

export type TerrainPreset = (typeof TERRAIN_PRESETS)[number]['id'];

export const STRUCTURE_PRESETS = [
  { id: 'tilted', label: '경사층' },
  { id: 'fault', label: '단층' },
  { id: 'unconformity', label: '부정합' },
  { id: 'fold', label: '습곡' },
] as const;

export type GeologicStructure = (typeof STRUCTURE_PRESETS)[number]['id'];

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

export function faultTraceCoordinate(x: number, z: number) {
  return x * 0.86 + z * 0.5;
}

export function unconformityHeight(x: number, z: number) {
  return 0.24 + 0.07 * Math.sin(x * 0.85) + 0.035 * Math.cos(z * 1.2);
}

function indexFromCoordinate(coordinate: number, boundaries: readonly number[]) {
  for (let index = 0; index < boundaries.length; index += 1) {
    if (coordinate >= boundaries[index]) return index;
  }
  return boundaries.length;
}

export function layerIndexAt(
  x: number,
  y: number,
  z: number,
  strike: number,
  dip: number,
  boundaries: readonly number[] = LAYER_BOUNDARIES,
  structure: GeologicStructure = 'tilted',
  offset = 0,
) {
  const count = boundaries.length + 1;
  const spacing = Math.abs(boundaries[0] - (boundaries[1] ?? boundaries[0] - 0.63));
  const baseCoordinate = stratigraphicCoordinate(x, y, z, strike, dip) + offset;

  if (structure === 'fault') {
    const throwAmount = spacing * 1.35;
    return indexFromCoordinate(baseCoordinate + (faultTraceCoordinate(x, z) >= 0 ? throwAmount : 0), boundaries);
  }

  if (structure === 'fold') {
    const dipDirection = ((strike + 90) * Math.PI) / 180;
    const acrossFold = x * Math.sin(dipDirection) + z * Math.cos(dipDirection);
    const amplitude = 0.48 + Math.sin((Math.max(dip, 10) * Math.PI) / 180) * 0.9;
    return indexFromCoordinate(y - amplitude * Math.cos(acrossFold * 0.9) + offset, boundaries);
  }

  if (structure === 'unconformity') {
    const upperCount = Math.min(2, Math.max(1, count - 2));
    const contact = unconformityHeight(x, z) + offset;
    if (y >= contact) {
      const upperIndex = Math.floor((contact + upperCount * spacing - y) / spacing);
      return Math.max(0, Math.min(upperCount - 1, upperIndex));
    }

    const lowerCount = count - upperCount;
    const lowerTopCoordinate = 0.9;
    const lowerIndex = Math.floor((lowerTopCoordinate - baseCoordinate) / spacing);
    return upperCount + Math.max(0, Math.min(lowerCount - 1, lowerIndex));
  }

  return indexFromCoordinate(baseCoordinate, boundaries);
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
