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
  { id: 'ridge', label: '능선' },
  { id: 'valley', label: '계곡' },
  { id: 'uniform-slope', label: '일정 경사면' },
  { id: 'curved-slope', label: '굴곡 경사면' },
  { id: 'incised-slope', label: '하곡 경사면' },
  { id: 'cone', label: '원뿔산' },
  { id: 'u-valley', label: 'U자 계곡' },
  { id: 'twin-saddle', label: '쌍봉 안부' },
  { id: 'conical-hill', label: '둥근 구릉' },
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

export function surfaceHeight(x: number, z: number, terrain: TerrainPreset = 'ridge') {
  if (terrain === 'ridge') {
    const ridgeAxis = x + 0.42 * z - 0.15;
    const diagonalRidge = 0.94 * Math.exp(-(ridgeAxis ** 2) / 1.35);
    return 0.2 + 0.055 * z + diagonalRidge + 0.035 * Math.sin(z * 1.55);
  }

  if (terrain === 'valley') {
    const valleyAxis = x - 0.3 * z + 0.25;
    const windingValley = 0.88 * Math.exp(-(valleyAxis ** 2) / 0.72);
    return 0.92 + 0.045 * z - windingValley + 0.035 * Math.sin(z * 1.35);
  }

  if (terrain === 'uniform-slope') {
    return 0.48 + 0.15 * x + 0.025 * z;
  }

  if (terrain === 'curved-slope') {
    return 0.46 + 0.145 * x + 0.055 * z + 0.16 * Math.sin(z * 0.72) + 0.065 * Math.sin(x * 0.55);
  }

  if (terrain === 'incised-slope') {
    const channelAxis = x - 0.34 * Math.sin(z * 0.78);
    const channel = 0.3 * Math.exp(-(channelAxis ** 2) / 0.28);
    return 0.58 + 0.14 * x + 0.03 * z - channel;
  }

  if (terrain === 'cone') {
    const radius = Math.hypot((x - 0.12) / 3.35, (z + 0.08) / 2.55);
    return 0.1 + 1.34 * Math.max(0, 1 - radius);
  }

  if (terrain === 'u-valley') {
    const valleyAxis = x - 0.28 * Math.sin(z * 0.72);
    const valleyWall = 0.68 * (1 - Math.exp(-(valleyAxis ** 2) / 1.05));
    return 0.12 + valleyWall + 0.045 * z;
  }

  if (terrain === 'twin-saddle') {
    const westPeak = 1.06 * hill(x, z, -1.82, 0, 1.12, 1.45);
    const eastPeak = 1.06 * hill(x, z, 1.82, 0, 1.12, 1.45);
    const saddleNotch = 0.12 * hill(x, z, 0, 0, 0.9, 1.35);
    return 0.15 + westPeak + eastPeak - saddleNotch + 0.025 * z;
  }

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

  return 0.3;
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

const FAULT_X_COMPONENT = 0.86;
const FAULT_Z_COMPONENT = 0.5;
const FAULT_HORIZONTAL_LENGTH = Math.hypot(FAULT_X_COMPONENT, FAULT_Z_COMPONENT);
export const FAULT_REFERENCE_HEIGHT = 0.15;

export function faultTraceCoordinate(x: number, z: number) {
  return x * 0.86 + z * 0.5;
}

export function faultPlaneCoordinate(x: number, y: number, z: number, faultDip = 90) {
  const dipRadians = (faultDip * Math.PI) / 180;
  const horizontal = faultTraceCoordinate(x, z) / FAULT_HORIZONTAL_LENGTH;
  return horizontal * Math.sin(dipRadians) + (y - FAULT_REFERENCE_HEIGHT) * Math.cos(dipRadians);
}

export function faultXAtHeight(y: number, z: number, faultDip = 90) {
  const dipRadians = (faultDip * Math.PI) / 180;
  const horizontal = -((y - FAULT_REFERENCE_HEIGHT) * Math.cos(dipRadians)) / Math.max(Math.sin(dipRadians), 0.001);
  return (horizontal * FAULT_HORIZONTAL_LENGTH - FAULT_Z_COMPONENT * z) / FAULT_X_COMPONENT;
}

export function unconformityHeight(x: number, z: number, strike = 0, unconformityDip = 0) {
  const dipDirection = ((strike + 90) * Math.PI) / 180;
  const downDipDistance = x * Math.sin(dipDirection) + z * Math.cos(dipDirection);
  const dipRadians = (unconformityDip * Math.PI) / 180;
  return 0.24 - downDipDistance * Math.tan(dipRadians) + 0.07 * Math.sin(x * 0.85) + 0.035 * Math.cos(z * 1.2);
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
  faultDip = 90,
  unconformityDip = 0,
) {
  const count = boundaries.length + 1;
  const spacing = Math.abs(boundaries[0] - (boundaries[1] ?? boundaries[0] - 0.63));
  const baseCoordinate = stratigraphicCoordinate(x, y, z, strike, dip) + offset;

  if (structure === 'fault') {
    const throwAmount = spacing * 1.35;
    return indexFromCoordinate(baseCoordinate + (faultPlaneCoordinate(x, y, z, faultDip) >= 0 ? throwAmount : 0), boundaries);
  }

  if (structure === 'fold') {
    const dipDirection = ((strike + 90) * Math.PI) / 180;
    const acrossFold = x * Math.sin(dipDirection) + z * Math.cos(dipDirection);
    const amplitude = 0.48 + Math.sin((Math.max(dip, 10) * Math.PI) / 180) * 0.9;
    return indexFromCoordinate(y - amplitude * Math.cos(acrossFold * 0.9) + offset, boundaries);
  }

  if (structure === 'unconformity') {
    const upperCount = Math.min(2, Math.max(1, count - 2));
    const contact = unconformityHeight(x, z, strike, unconformityDip) + offset;
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

export type BeddingOrientation = {
  strike: number;
  dip: number;
  dipDirection: number;
};

function orientationFromGradient(
  gradientX: number,
  gradientZ: number,
  fallbackStrike: number,
): BeddingOrientation {
  const slope = Math.hypot(gradientX, gradientZ);
  const normalizedFallback = ((fallbackStrike % 180) + 180) % 180;

  if (slope < 0.0001) {
    return {
      strike: normalizedFallback,
      dip: 0,
      dipDirection: (normalizedFallback + 90) % 360,
    };
  }

  const dipDirection = ((Math.atan2(-gradientX, -gradientZ) * 180) / Math.PI + 360) % 360;
  return {
    strike: (dipDirection + 270) % 180,
    dip: (Math.atan(slope) * 180) / Math.PI,
    dipDirection,
  };
}

/** 지질 평면도의 한 지점에 노출된 지층면의 실제 국소 주향·경사. */
export function beddingOrientationAt(
  x: number,
  z: number,
  strike: number,
  dip: number,
  terrain: TerrainPreset,
  structure: GeologicStructure,
  boundaries: readonly number[] = LAYER_BOUNDARIES,
  offset = 0,
  unconformityDip = 0,
): BeddingOrientation {
  const normalizedStrike = ((strike % 180) + 180) % 180;
  const fixedOrientation = {
    strike: normalizedStrike,
    dip,
    dipDirection: (normalizedStrike + 90) % 360,
  };

  if (structure === 'fold') {
    const dipDirectionRadians = ((strike + 90) * Math.PI) / 180;
    const acrossFold = x * Math.sin(dipDirectionRadians) + z * Math.cos(dipDirectionRadians);
    const amplitude = 0.48 + Math.sin((Math.max(dip, 10) * Math.PI) / 180) * 0.9;
    const acrossGradient = -amplitude * 0.9 * Math.sin(acrossFold * 0.9);
    return orientationFromGradient(
      acrossGradient * Math.sin(dipDirectionRadians),
      acrossGradient * Math.cos(dipDirectionRadians),
      normalizedStrike,
    );
  }

  if (structure === 'unconformity') {
    const layerCount = boundaries.length + 1;
    const upperCount = Math.min(2, Math.max(1, layerCount - 2));
    const y = surfaceHeight(x, z, terrain);
    const exposedLayer = layerIndexAt(
      x,
      y,
      z,
      strike,
      dip,
      boundaries,
      structure,
      offset,
      90,
      unconformityDip,
    );

    if (exposedLayer < upperCount) {
      const sample = 0.002;
      const gradientX = (
        unconformityHeight(x + sample, z, strike, unconformityDip)
        - unconformityHeight(x - sample, z, strike, unconformityDip)
      ) / (sample * 2);
      const gradientZ = (
        unconformityHeight(x, z + sample, strike, unconformityDip)
        - unconformityHeight(x, z - sample, strike, unconformityDip)
      ) / (sample * 2);
      return orientationFromGradient(gradientX, gradientZ, normalizedStrike);
    }
  }

  return fixedOrientation;
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
