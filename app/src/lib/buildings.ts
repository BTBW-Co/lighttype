import { THE_PARK_DROR } from "@/lib/the-park";

export type Point2 = [number, number];

export type ApartmentType =
  | "studio"
  | "1br"
  | "2br"
  | "3br"
  | "garden"
  | "penthouse"
  | "park141"
  | "park141kitchen"
  | "park141living"
  | "parkGarden"
  | "parkGarden2"
  | "park170"
  | "park170bbq"
  | "park170hall"
  | "park170office"
  | "park219"
  | "park219gourmet"
  | "park219living";

export type Room = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Apartment = {
  id: string;
  name: string;
  type: ApartmentType;
  areaM2: number;
  bedrooms: number;
  suites?: number;
  parking?: number;
  variant?: string;
  highlights?: string[];
  rooms: Room[];
};

export type FloorPlan = {
  id: string;
  name: string;
  level: number;
  units: Apartment[];
};

export type LandscapeKind =
  | "lawn"
  | "path"
  | "plaza"
  | "hedge"
  | "bed"
  | "pool"
  | "tree"
  | "tennis"
  | "court"
  | "playground"
  | "pavilion";

export type LandscapeItem = {
  kind: LandscapeKind;
  x: number;
  z: number;
  w?: number;
  d?: number;
  height?: number;
  scale?: number;
  label?: string;
};

export type BuildingFacts = {
  developer: string;
  design: string;
  status: string;
  address: string;
  city: string;
  launch?: string;
  delivered?: string;
  lotM2?: number;
  privateM2?: number;
  towers?: number;
  residences?: number;
  floorsLabel?: string;
  parking?: string;
  suitesLabel?: string;
  areaRange?: string;
};

export type SiteTower = {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floorHeight: number;
  unitsPerFloor: number;
  stories: number;
  detailed: boolean;
  floors: FloorPlan[];
};

export type BuildingPlan = {
  id: string;
  name: string;
  neighborhood: string;
  description: string;
  floors: FloorPlan[];
  floorHeight: number;
  width: number;
  depth: number;
  landscape: LandscapeItem[];
  facts?: BuildingFacts;
  amenities?: string[];
  towers?: SiteTower[];
};

export const APARTMENT_META: Record<
  ApartmentType,
  { label: string; color: string; soft: string }
> = {
  studio: { label: "Studio", color: "#C4A484", soft: "#F6EFE6" },
  "1br": { label: "1 bedroom", color: "#D9896A", soft: "#F8E6DC" },
  "2br": { label: "2 bedrooms", color: "#E5484D", soft: "#FDECEC" },
  "3br": { label: "3 bedrooms", color: "#8C6A5A", soft: "#F0E7E1" },
  garden: { label: "Garden", color: "#6B8F71", soft: "#E7F0E8" },
  penthouse: { label: "Penthouse", color: "#3D3A37", soft: "#EDEBE8" },
  park141: { label: "3 suítes 141 m² — padrão", color: "#C4A484", soft: "#F6EFE6" },
  park141kitchen: { label: "3 suítes 143 m² — cozinha integrada", color: "#D4B896", soft: "#F8F1E6" },
  park141living: { label: "3 suítes 141 m² — living estendido", color: "#B8956A", soft: "#F4EBE0" },
  parkGarden: { label: "Garden 213 m²", color: "#6B8F71", soft: "#E7F0E8" },
  parkGarden2: { label: "Garden 220 m²", color: "#7A9B78", soft: "#EAF2EA" },
  park170: { label: "3 suítes 172 m² — padrão", color: "#D9896A", soft: "#F8E6DC" },
  park170bbq: { label: "3 suítes 175 m² — churrasqueira", color: "#E09A7A", soft: "#FBEDE4" },
  park170hall: { label: "3 suítes 170 m² — hall aberto", color: "#C67B5C", soft: "#F6E4DA" },
  park170office: { label: "3 suítes 174 m² — office", color: "#B86B4A", soft: "#F3DFD4" },
  park219: { label: "3 suítes 219 m² — padrão", color: "#8C6A5A", soft: "#F0E7E1" },
  park219gourmet: { label: "3 suítes 227 m² — gourmet integrado", color: "#7A5848", soft: "#EBE3DD" },
  park219living: { label: "3 suítes 223 m² — living estendido", color: "#6A4A3A", soft: "#E8E0D9" },
};

export function room(id: string, name: string, x: number, y: number, w: number, h: number): Room {
  return { id, name, x, y, w, h };
}

function area(rooms: Room[]) {
  return Math.round(rooms.reduce((sum, r) => sum + r.w * r.h, 0));
}

export function withArea(unit: {
  id: string;
  name: string;
  type: string;
  bedrooms: number;
  rooms: Room[];
  suites?: number;
  parking?: number;
  variant?: string;
  highlights?: string[];
  areaM2?: number;
}): Apartment {
  return {
    ...unit,
    type: unit.type as ApartmentType,
    areaM2: unit.areaM2 && unit.areaM2 > 0 ? unit.areaM2 : area(unit.rooms),
  };
}

const AURORA_TYPICAL: Apartment[] = [
  {
    id: "a",
    name: "A",
    type: "1br",
    bedrooms: 1,
    rooms: [
      room("a-liv", "Living", 0.4, 0.4, 6.2, 4.8),
      room("a-bed", "Bedroom", 0.4, 5.4, 4.4, 3.6),
      room("a-bath", "Bath", 5.0, 5.4, 1.6, 3.6),
    ],
    areaM2: 0,
  },
  {
    id: "b",
    name: "B",
    type: "2br",
    bedrooms: 2,
    rooms: [
      room("b-liv", "Living", 7.0, 0.4, 5.6, 5.2),
      room("b-bed1", "Bedroom 1", 12.8, 0.4, 4.8, 3.4),
      room("b-bed2", "Bedroom 2", 12.8, 4.0, 4.8, 3.2),
      room("b-bath", "Bath", 7.0, 5.8, 2.4, 3.2),
      room("b-kit", "Kitchen", 9.6, 5.8, 3.0, 3.2),
    ],
    areaM2: 0,
  },
  {
    id: "c",
    name: "C",
    type: "2br",
    bedrooms: 2,
    rooms: [
      room("c-liv", "Living", 0.4, 9.4, 6.4, 4.8),
      room("c-bed1", "Bedroom 1", 0.4, 14.4, 4.6, 3.6),
      room("c-bed2", "Bedroom 2", 5.2, 14.4, 4.4, 3.6),
      room("c-bath", "Bath", 7.0, 9.4, 2.6, 2.4),
      room("c-kit", "Kitchen", 7.0, 12.0, 2.6, 2.2),
    ],
    areaM2: 0,
  },
  {
    id: "d",
    name: "D",
    type: "studio",
    bedrooms: 0,
    rooms: [
      room("d-liv", "Living", 10.0, 9.4, 7.6, 5.0),
      room("d-bath", "Bath", 10.0, 14.6, 2.2, 3.4),
      room("d-alc", "Sleeping alcove", 12.4, 14.6, 5.2, 3.4),
    ],
    areaM2: 0,
  },
].map(withArea);

function typicalFloor(level: number, name: string): FloorPlan {
  return {
    id: `aurora-${level}`,
    name,
    level,
    units: AURORA_TYPICAL.map((unit) => ({
      ...unit,
      id: `${level}-${unit.id}`,
      rooms: unit.rooms.map((r) => ({ ...r, id: `${level}-${r.id}` })),
    })),
  };
}

export const RESIDENCIAL_AURORA: BuildingPlan = {
  id: "aurora",
  name: "Residencial Aurora",
  neighborhood: "Jardins",
  description: "A mid-rise with garden homes, one- and two-bedroom flats, and a pair of penthouses.",
  floorHeight: 3.05,
  width: 18,
  depth: 18.4,
  landscape: [
    { kind: "lawn", x: -8, z: -7, w: 34, d: 34 },
    { kind: "plaza", x: 3, z: -5.4, w: 12, d: 4.6 },
    { kind: "path", x: 7.4, z: -7, w: 3.2, d: 7.4 },
    { kind: "path", x: -6, z: 8.2, w: 6.2, d: 2 },
    { kind: "path", x: 18.2, z: 8.2, w: 6.2, d: 2 },
    { kind: "bed", x: -5.6, z: 0.6, w: 5, d: 7.2 },
    { kind: "bed", x: 18.6, z: 0.6, w: 5, d: 7.2 },
    { kind: "bed", x: 1, z: 19.2, w: 16, d: 4.4 },
    { kind: "hedge", x: -7.4, z: -6.4, w: 0.5, d: 32, height: 1.1 },
    { kind: "hedge", x: 25, z: -6.4, w: 0.5, d: 32, height: 1.1 },
    { kind: "hedge", x: -7.4, z: 25.2, w: 32.9, d: 0.5, height: 1.1 },
    { kind: "pool", x: 20.2, z: 19.6, w: 5.2, d: 3.6 },
    { kind: "tree", x: -3.4, z: -3.2, scale: 1.15 },
    { kind: "tree", x: 1.2, z: -3.8, scale: 0.9 },
    { kind: "tree", x: 16.6, z: -3.6, scale: 1 },
    { kind: "tree", x: 22.4, z: -2.8, scale: 1.2 },
    { kind: "tree", x: -3.8, z: 4.4, scale: 0.85 },
    { kind: "tree", x: -3.2, z: 14.2, scale: 1.05 },
    { kind: "tree", x: 22.8, z: 4.8, scale: 0.95 },
    { kind: "tree", x: 22.2, z: 14.6, scale: 1.1 },
    { kind: "tree", x: 4.2, z: 22.4, scale: 0.9 },
    { kind: "tree", x: 13.6, z: 22.8, scale: 1.05 },
  ],
  floors: [
    {
      id: "aurora-0",
      name: "Garden",
      level: 0,
      units: [
        {
          id: "0-g1",
          name: "G1",
          type: "garden",
          bedrooms: 2,
          rooms: [
            room("g1-liv", "Living", 0.4, 0.4, 8.4, 6.4),
            room("g1-bed1", "Bedroom 1", 0.4, 7.0, 4.6, 4.2),
            room("g1-bed2", "Bedroom 2", 5.2, 7.0, 3.6, 4.2),
            room("g1-kit", "Kitchen", 9.0, 0.4, 3.6, 3.4),
            room("g1-bath", "Bath", 9.0, 4.0, 3.6, 3.0),
          ],
          areaM2: 0,
        },
        {
          id: "0-g2",
          name: "G2",
          type: "garden",
          bedrooms: 1,
          rooms: [
            room("g2-liv", "Living", 13.0, 0.4, 4.6, 10.8),
            room("g2-bed", "Bedroom", 13.0, 11.4, 4.6, 6.6),
          ],
          areaM2: 0,
        },
      ].map(withArea),
    },
    typicalFloor(1, "Floor 1"),
    typicalFloor(2, "Floor 2"),
    typicalFloor(3, "Floor 3"),
    {
      id: "aurora-4",
      name: "Penthouses",
      level: 4,
      units: [
        {
          id: "4-p1",
          name: "PH1",
          type: "penthouse",
          bedrooms: 3,
          rooms: [
            room("p1-liv", "Living", 0.4, 0.4, 8.8, 8.0),
            room("p1-bed1", "Suite", 0.4, 8.6, 5.2, 5.4),
            room("p1-bed2", "Bedroom 2", 5.8, 8.6, 3.4, 5.4),
            room("p1-kit", "Kitchen", 9.4, 0.4, 3.2, 4.2),
            room("p1-bath", "Bath", 9.4, 4.8, 3.2, 3.2),
          ],
          areaM2: 0,
        },
        {
          id: "4-p2",
          name: "PH2",
          type: "penthouse",
          bedrooms: 2,
          rooms: [
            room("p2-liv", "Living", 12.8, 0.4, 4.8, 9.4),
            room("p2-bed1", "Suite", 12.8, 10.0, 4.8, 4.0),
            room("p2-bed2", "Bedroom", 12.8, 14.2, 4.8, 3.8),
          ],
          areaM2: 0,
        },
      ].map(withArea),
    },
  ],
};

export const CASA_JARDIM: BuildingPlan = {
  id: "jardim",
  name: "Casa Jardim",
  neighborhood: "Pinheiros",
  description: "A compact three-story house with two residences per floor.",
  floorHeight: 3.1,
  width: 14.4,
  depth: 12.2,
  landscape: [
    { kind: "lawn", x: -6, z: -5.5, w: 26.4, d: 24 },
    { kind: "plaza", x: 3.2, z: -4.2, w: 8, d: 3.8 },
    { kind: "path", x: 6, z: -5.5, w: 2.4, d: 6 },
    { kind: "bed", x: -4.4, z: 0.8, w: 3.8, d: 10.4 },
    { kind: "bed", x: 15, z: 0.8, w: 3.8, d: 10.4 },
    { kind: "bed", x: 2, z: 13, w: 10.4, d: 3.4 },
    { kind: "hedge", x: -5.4, z: -5, w: 0.45, d: 23, height: 0.9 },
    { kind: "hedge", x: 19.6, z: -5, w: 0.45, d: 23, height: 0.9 },
    { kind: "hedge", x: -5.4, z: 17.6, w: 25.45, d: 0.45, height: 0.9 },
    { kind: "tree", x: -2.4, z: -2.6, scale: 1 },
    { kind: "tree", x: 16.8, z: -2.4, scale: 1.1 },
    { kind: "tree", x: -2.2, z: 11.2, scale: 0.85 },
    { kind: "tree", x: 16.6, z: 11.6, scale: 0.95 },
    { kind: "tree", x: 7.2, z: 15.4, scale: 1.15 },
  ],
  floors: [0, 1, 2].map((level) => ({
    id: `jardim-${level}`,
    name: level === 0 ? "Garden" : `Floor ${level}`,
    level,
    units: [
      {
        id: `${level}-l`,
        name: "L",
        type: level === 2 ? "penthouse" : level === 0 ? "garden" : "2br",
        bedrooms: 2,
        rooms: [
          room(`${level}-l-liv`, "Living", 0.4, 0.4, 6.6, 5.4),
          room(`${level}-l-bed1`, "Bedroom 1", 0.4, 6.0, 3.8, 5.8),
          room(`${level}-l-bed2`, "Bedroom 2", 4.4, 6.0, 2.6, 3.2),
          room(`${level}-l-bath`, "Bath", 4.4, 9.4, 2.6, 2.4),
        ],
        areaM2: 0,
      },
      {
        id: `${level}-r`,
        name: "R",
        type: level === 2 ? "3br" : "1br",
        bedrooms: level === 2 ? 3 : 1,
        rooms: [
          room(`${level}-r-liv`, "Living", 7.4, 0.4, 6.6, 6.2),
          room(`${level}-r-bed`, "Bedroom", 7.4, 6.8, 4.0, 5.0),
          room(`${level}-r-bath`, "Bath", 11.6, 6.8, 2.4, 5.0),
        ],
        areaM2: 0,
      },
    ].map(withArea),
  })),
};

export const TORRE_LESTE: BuildingPlan = {
  id: "torre",
  name: "Torre Leste",
  neighborhood: "Vila Olímpia",
  description: "A slim six-story tower. Same plate on every floor, easy to compare layouts.",
  floorHeight: 2.95,
  width: 12.6,
  depth: 16.2,
  landscape: [
    { kind: "lawn", x: -5.5, z: -6, w: 24, d: 28 },
    { kind: "plaza", x: 2.2, z: -4.8, w: 8.2, d: 4.4 },
    { kind: "path", x: 5, z: -6, w: 2.6, d: 6.4 },
    { kind: "path", x: -4.6, z: 7, w: 4.4, d: 2 },
    { kind: "path", x: 13, z: 7, w: 4.6, d: 2 },
    { kind: "bed", x: -4.2, z: 0.6, w: 3.6, d: 6 },
    { kind: "bed", x: 13.4, z: 0.6, w: 3.6, d: 6 },
    { kind: "bed", x: 1.4, z: 17, w: 9.8, d: 3.2 },
    { kind: "hedge", x: -5, z: -5.4, w: 0.4, d: 26.6, height: 1 },
    { kind: "hedge", x: 17.8, z: -5.4, w: 0.4, d: 26.6, height: 1 },
    { kind: "hedge", x: -5, z: 20.8, w: 23.2, d: 0.4, height: 1 },
    { kind: "tree", x: -2.6, z: -3.2, scale: 1.05 },
    { kind: "tree", x: 15.4, z: -3, scale: 1 },
    { kind: "tree", x: -2.4, z: 15.6, scale: 0.9 },
    { kind: "tree", x: 15.6, z: 16, scale: 1.1 },
    { kind: "tree", x: 6.3, z: 19.4, scale: 0.85 },
  ],
  floors: Array.from({ length: 6 }, (_, level) => ({
    id: `torre-${level}`,
    name: level === 0 ? "Lobby residences" : `Floor ${level}`,
    level,
    units: [
      {
        id: `${level}-n`,
        name: "N",
        type: level >= 5 ? "penthouse" : "2br",
        bedrooms: 2,
        rooms: [
          room(`${level}-n-liv`, "Living", 0.4, 0.4, 5.6, 7.6),
          room(`${level}-n-bed1`, "Bedroom 1", 0.4, 8.2, 5.6, 3.6),
          room(`${level}-n-bed2`, "Bedroom 2", 0.4, 12.0, 3.4, 3.8),
          room(`${level}-n-bath`, "Bath", 4.0, 12.0, 2.0, 3.8),
        ],
        areaM2: 0,
      },
      {
        id: `${level}-s`,
        name: "S",
        type: level === 0 ? "studio" : "1br",
        bedrooms: level === 0 ? 0 : 1,
        rooms: [
          room(`${level}-s-liv`, "Living", 6.4, 0.4, 5.8, 8.8),
          room(`${level}-s-bed`, "Bedroom", 6.4, 9.4, 5.8, 4.0),
          room(`${level}-s-bath`, "Bath", 6.4, 13.6, 5.8, 2.2),
        ],
        areaM2: 0,
      },
    ].map(withArea),
  })),
};

export const BUILDINGS: BuildingPlan[] = [THE_PARK_DROR, RESIDENCIAL_AURORA, CASA_JARDIM, TORRE_LESTE];

export function getBuilding(id: string) {
  return BUILDINGS.find((b) => b.id === id) ?? BUILDINGS[0];
}

export function buildingTowers(building: BuildingPlan): SiteTower[] {
  if (building.towers?.length) return building.towers;
  return [
    {
      id: "main",
      name: building.name,
      x: 0,
      z: 0,
      width: building.width,
      depth: building.depth,
      floorHeight: building.floorHeight,
      unitsPerFloor: building.floors[0]?.units.length ?? 0,
      stories: building.floors.length,
      detailed: true,
      floors: building.floors,
    },
  ];
}

export function towerHeight(tower: SiteTower) {
  return tower.stories * tower.floorHeight;
}

export type ListedUnit = Apartment & {
  floorId: string;
  floorName: string;
  floorLevel: number;
  towerId: string;
  towerName: string;
};

export function listUnits(building: BuildingPlan): ListedUnit[] {
  return buildingTowers(building).flatMap((tower) =>
    tower.floors.flatMap((floor) =>
      floor.units.map((unit) => ({
        ...unit,
        floorId: floor.id,
        floorName: floor.name,
        floorLevel: floor.level,
        towerId: tower.id,
        towerName: tower.name,
      })),
    ),
  );
}

export function uniqueTypes(building: BuildingPlan): ApartmentType[] {
  const seen = new Set<ApartmentType>();
  for (const unit of listUnits(building)) seen.add(unit.type);
  return Array.from(seen);
}

export function buildingStats(building: BuildingPlan) {
  const units = listUnits(building);
  return {
    floors: building.facts?.floorsLabel ?? `${building.floors.length} floors`,
    apartments: building.facts?.residences ?? units.length,
    types: uniqueTypes(building).length,
  };
}

export type ViewMode = "site" | "building" | "unit";

export function towerCenter(tower: SiteTower) {
  return {
    x: tower.x + tower.width / 2,
    y: towerHeight(tower) * 0.42,
    z: tower.z + tower.depth / 2,
  };
}

export function unitWorldBox(building: BuildingPlan, unit: ListedUnit) {
  const tower = buildingTowers(building).find((item) => item.id === unit.towerId) ?? buildingTowers(building)[0];
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const item of unit.rooms) {
    minX = Math.min(minX, item.x);
    minZ = Math.min(minZ, item.y);
    maxX = Math.max(maxX, item.x + item.w);
    maxZ = Math.max(maxZ, item.y + item.h);
  }
  return {
    x: tower.x + (minX + maxX) / 2,
    y: unit.floorLevel * tower.floorHeight + tower.floorHeight * 0.55,
    z: tower.z + (minZ + maxZ) / 2,
    w: Math.max(4, maxX - minX),
    d: Math.max(4, maxZ - minZ),
    h: tower.floorHeight,
  };
}

export function siteBounds(building: BuildingPlan) {
  let minX = 0;
  let minZ = 0;
  let maxX = building.width;
  let maxZ = building.depth;
  for (const tower of building.towers ?? []) {
    minX = Math.min(minX, tower.x);
    minZ = Math.min(minZ, tower.z);
    maxX = Math.max(maxX, tower.x + tower.width);
    maxZ = Math.max(maxZ, tower.z + tower.depth);
  }
  for (const item of building.landscape) {
    const w = item.w ?? (item.kind === "tree" ? 2 : 1);
    const d = item.d ?? (item.kind === "tree" ? 2 : 1);
    minX = Math.min(minX, item.x);
    minZ = Math.min(minZ, item.z);
    maxX = Math.max(maxX, item.x + w);
    maxZ = Math.max(maxZ, item.z + d);
  }
  return { minX, minZ, maxX, maxZ };
}
