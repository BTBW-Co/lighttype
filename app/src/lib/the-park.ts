import {
  room,
  withArea,
  type Apartment,
  type ApartmentType,
  type BuildingPlan,
  type FloorPlan,
  type LandscapeItem,
  type Room,
  type SiteTower,
} from "@/lib/buildings";

function shift(rooms: Room[], ox: number, oy: number, prefix: string): Room[] {
  return rooms.map((r) => ({ ...r, id: `${prefix}-${r.id}`, x: r.x + ox, y: r.y + oy }));
}

function finish(
  id: string,
  name: string,
  type: ApartmentType,
  areaM2: number,
  parking: number,
  variant: string,
  highlights: string[],
  rooms: Room[],
): Apartment {
  return withArea({
    id,
    name,
    type,
    bedrooms: 3,
    suites: 3,
    parking,
    variant,
    highlights,
    rooms,
    areaM2,
  });
}

function layout141(kind: "padrao" | "cozinha" | "living"): Room[] {
  const livingW = kind === "living" ? 8.2 : 7.0;
  const diningX = 2.8 + livingW + 0.2;
  const diningW = kind === "living" ? 3.8 : 5.0;
  const kitchen = kind === "cozinha"
    ? [room("coz", "Cozinha integrada", 7.0, 5.4, 4.6, 2.6)]
    : [room("coz", "Cozinha", 7.2, 5.4, 3.8, 2.6)];
  return [
    room("hall", kind === "living" ? "Hall" : "Hall privativo", 0.2, 0.2, 2.4, 2.6),
    room("liv", kind === "living" ? "Living estendido" : "Living", 2.8, 0.2, livingW, 5.0),
    room("jan", "Sala de jantar", diningX, 0.2, diningW, 3.4),
    room("lav", "Lavabo", diningX, 3.7, 1.8, 1.5),
    room("bbq", "Churrasqueira", 2.8, 5.4, kind === "living" ? 3.6 : 4.2, 2.4),
    ...kitchen,
    room("srv", "Serviço", 11.2, 5.4, 3.8, 2.4),
    room("pass", "Passagem íntima", 0.2, 8.2, 1.4, 5.6),
    room("mas", "Suíte master", 1.8, 8.2, 4.8, 4.4),
    room("clo", "Closet", 1.8, 12.7, 2.4, 2.1),
    room("bm", "Banho master", 4.4, 12.7, 2.2, 2.1),
    room("s2", "Suíte 2", 6.8, 8.2, 4.0, 3.6),
    room("b2", "Banho 2", 10.9, 8.2, 2.1, 2.4),
    room("s3", "Suíte 3", 6.8, 11.9, 4.0, 2.9),
    room("b3", "Banho 3", 10.9, 10.7, 2.1, 2.4),
  ];
}

function layoutGarden(kind: "g1" | "g2"): Room[] {
  const extra =
    kind === "g1"
      ? [
          room("ter", "Terraço garden", 0.2, -6.0, 14.8, 5.6),
          room("pis", "Espera para piscina", 4.2, -4.6, 5.2, 3.0),
        ]
      : [
          room("ter", "Terraço garden", -0.2, -6.4, 15.4, 6.0),
          room("jar", "Jardim privativo", 8.6, -6.0, 6.4, 5.4),
        ];
  return [...layout141("padrao"), ...extra];
}

function layout170(kind: "padrao" | "bbq" | "hall" | "office"): Room[] {
  const hallW = kind === "hall" ? 3.6 : 2.6;
  const livingX = hallW + 0.4;
  const livingW = kind === "office" ? 6.6 : 8.0;
  const extra =
    kind === "office"
      ? [room("off", "Office", livingX + livingW + 0.2, 0.2, 3.4, 3.2)]
      : [room("jan", "Sala de jantar", livingX + livingW + 0.2, 0.2, kind === "hall" ? 3.6 : 4.2, 3.6)];
  return [
    room("hall", kind === "hall" ? "Hall aberto" : "Hall privativo", 0.2, 0.2, hallW, kind === "hall" ? 3.4 : 2.8),
    room("liv", "Living 3 ambientes", livingX, 0.2, livingW, 5.4),
    ...extra,
    room("lav", "Lavabo", 11.4, 4.0, 1.8, 1.6),
    room("bbq", kind === "bbq" ? "Churrasqueira ampla" : "Churrasqueira", 2.8, 5.8, kind === "bbq" ? 5.4 : 4.4, 2.6),
    room("coz", "Cozinha", 8.4, 5.8, 3.8, 2.8),
    room("srv", "Serviço", 12.4, 5.8, 3.2, 2.6),
    room("pass", "Passagem íntima", 0.2, 8.8, 1.4, 5.8),
    room("mas", "Suíte master", 1.8, 8.8, 5.0, 4.6),
    room("clo", "Closet", 1.8, 13.5, 2.6, 2.1),
    room("bm", "Banho master", 4.6, 13.5, 2.2, 2.1),
    room("s2", "Suíte 2", 7.0, 8.8, 4.2, 3.6),
    room("b2", "Banho 2", 11.4, 8.8, 2.2, 2.4),
    room("s3", "Suíte 3", 7.0, 12.6, 4.2, 3.0),
    room("b3", "Banho 3", 11.4, 11.4, 2.2, 2.4),
  ];
}

function layout219(kind: "padrao" | "gourmet" | "living"): Room[] {
  const livingW = kind === "living" ? 10.4 : 9.2;
  const gourmetW = kind === "gourmet" ? 6.6 : 5.4;
  return [
    room("hall", "Hall privativo", 0.2, 0.2, 3.0, 3.2),
    room("liv", kind === "living" ? "Living estendido" : "Living", 3.4, 0.2, livingW, 6.0),
    room("jan", kind === "gourmet" ? "Jantar / gourmet" : "Sala de jantar", 3.4 + livingW + 0.2, 0.2, kind === "living" ? 4.6 : 5.6, 4.0),
    room("lav", "Lavabo", 13.0, 4.4, 2.0, 1.8),
    room("bbq", kind === "gourmet" ? "Gourmet integrado" : "Churrasqueira", 3.4, 6.4, gourmetW, 3.0),
    room("coz", "Cozinha", 3.4 + gourmetW + 0.2, 6.4, 4.4, 3.2),
    room("srv", "Serviço", 14.6, 6.4, 3.8, 2.6),
    room("pass", "Passagem íntima", 0.2, 10.0, 1.6, 6.2),
    room("mas", "Suíte master", 2.0, 10.0, 5.6, 4.8),
    room("clo", "Closet", 7.8, 10.0, 2.8, 2.4),
    room("bm", "Banho master", 7.8, 12.6, 2.8, 2.2),
    room("s2", "Suíte 2", 10.8, 10.0, 4.4, 3.8),
    room("b2", "Banho 2", 15.4, 10.0, 3.0, 2.4),
    room("s3", "Suíte 3", 10.8, 14.0, 4.4, 3.2),
    room("b3", "Banho 3", 15.4, 12.6, 3.0, 2.4),
  ];
}

const H141 = [
  "Hall privativo",
  "Suíte master com closet",
  "Passagem íntima",
  "Living com lareira",
  "Churrasqueira",
  "2 vagas",
];
const H170 = [
  "Hall privativo",
  "Living 3 ambientes com lareira",
  "Suíte master com closet",
  "Passagem íntima",
  "2 a 3 vagas",
];
const H219 = [
  "Hall privativo",
  "Living amplo",
  "Suíte master com closet",
  "Gourmet",
  "3 vagas",
];

function unit141(id: string, name: string, ox: number, oy: number, kind: "padrao" | "cozinha" | "living"): Apartment {
  const map = {
    padrao: { type: "park141" as const, area: 142, variant: "padrão" },
    cozinha: { type: "park141kitchen" as const, area: 143, variant: "cozinha integrada" },
    living: { type: "park141living" as const, area: 141, variant: "living estendido" },
  }[kind];
  return finish(id, name, map.type, map.area, 2, map.variant, H141, shift(layout141(kind), ox, oy, id));
}

function unitGarden(id: string, name: string, ox: number, oy: number, kind: "g1" | "g2"): Apartment {
  const map = {
    g1: { type: "parkGarden" as const, area: 213, variant: "planta garden" },
    g2: { type: "parkGarden2" as const, area: 220, variant: "planta garden 2" },
  }[kind];
  return finish(
    id,
    name,
    map.type,
    map.area,
    2,
    map.variant,
    [...H141, "Terraço garden", "Espera para piscina"],
    shift(layoutGarden(kind), ox, oy, id),
  );
}

function unit170(id: string, name: string, ox: number, oy: number, kind: "padrao" | "bbq" | "hall" | "office"): Apartment {
  const map = {
    padrao: { type: "park170" as const, area: 172, variant: "padrão", extra: [] as string[] },
    bbq: { type: "park170bbq" as const, area: 175, variant: "churrasqueira", extra: ["Churrasqueira ampla"] },
    hall: { type: "park170hall" as const, area: 170, variant: "hall aberto", extra: ["Hall aberto"] },
    office: { type: "park170office" as const, area: 174, variant: "office", extra: ["Home office"] },
  }[kind];
  return finish(id, name, map.type, map.area, 3, map.variant, [...H170, ...map.extra], shift(layout170(kind), ox, oy, id));
}

function unit219(id: string, name: string, ox: number, oy: number, kind: "padrao" | "gourmet" | "living"): Apartment {
  const map = {
    padrao: { type: "park219" as const, area: 219, variant: "padrão" },
    gourmet: { type: "park219gourmet" as const, area: 227, variant: "gourmet integrado" },
    living: { type: "park219living" as const, area: 223, variant: "living estendido" },
  }[kind];
  return finish(id, name, map.type, map.area, 3, map.variant, H219, shift(layout219(kind), ox, oy, id));
}

const KINDS_141: Array<"padrao" | "cozinha" | "living"> = ["padrao", "cozinha", "living"];
const KINDS_170: Array<"padrao" | "bbq" | "hall" | "office"> = ["padrao", "bbq", "hall", "office"];
const KINDS_219: Array<"padrao" | "gourmet" | "living"> = ["padrao", "gourmet", "living"];

function floor141(level: number): FloorPlan {
  const k = KINDS_141;
  return {
    id: `park-a-${level}`,
    name: `Torre A · ${level}º`,
    level,
    units: [
      unit141(`${level}-a`, "A", 0.4, 0.4, k[level % 3]),
      unit141(`${level}-b`, "B", 16.2, 0.4, k[(level + 1) % 3]),
      unit141(`${level}-c`, "C", 0.4, 15.4, k[(level + 2) % 3]),
      unit141(`${level}-d`, "D", 16.2, 15.4, k[level % 3]),
    ],
  };
}

function floor170(level: number): FloorPlan {
  const k = KINDS_170;
  return {
    id: `park-a-${level}`,
    name: `Torre A · ${level}º`,
    level,
    units: [
      unit170(`${level}-a`, "A", 0.4, 0.4, k[level % 4]),
      unit170(`${level}-b`, "B", 16.2, 0.4, k[(level + 1) % 4]),
      unit170(`${level}-c`, "C", 0.4, 15.4, k[(level + 2) % 4]),
      unit170(`${level}-d`, "D", 16.2, 15.4, k[(level + 3) % 4]),
    ],
  };
}

function floor219(level: number): FloorPlan {
  const k = KINDS_219;
  return {
    id: `park-c-${level}`,
    name: `Torre C · ${level}º`,
    level,
    units: [
      unit219(`${level}-n`, "N", 0.4, 0.4, k[level % 3]),
      unit219(`${level}-s`, "S", 0.4, 17.2, k[(level + 1) % 3]),
    ],
  };
}

function trees(points: Array<[number, number, number?]>): LandscapeItem[] {
  return points.map(([x, z, scale]) => ({ kind: "tree", x, z, scale: scale ?? 1 }));
}

const PARK_LANDSCAPE: LandscapeItem[] = [
  { kind: "lawn", x: -4, z: -4, w: 126, d: 100 },
  { kind: "plaza", x: 36, z: 82, w: 40, d: 8, label: "Acesso · Cel. Paulino Teixeira" },
  { kind: "path", x: 52, z: 40, w: 4, d: 42 },
  { kind: "path", x: 20, z: 40, w: 3.2, d: 20 },
  { kind: "path", x: 88, z: 40, w: 3.2, d: 20 },
  { kind: "path", x: 12, z: 18, w: 90, d: 2.6 },
  { kind: "bed", x: 6, z: 42, w: 4, d: 36 },
  { kind: "bed", x: 40, z: 42, w: 5, d: 36 },
  { kind: "bed", x: 78, z: 44, w: 4, d: 32 },
  { kind: "bed", x: 104, z: 44, w: 4, d: 32 },
  { kind: "pool", x: 14, z: 7, w: 25, d: 8, label: "Piscina raia 25 m" },
  { kind: "pool", x: 41, z: 9, w: 8, d: 5, label: "Piscina infantil" },
  { kind: "pavilion", x: 54, z: 5, w: 16, d: 12, height: 4.2, label: "Piscina coberta aquecida" },
  { kind: "pool", x: 56.5, z: 7.4, w: 11, d: 7.2 },
  { kind: "tennis", x: 78, z: 5, w: 23.8, d: 11, label: "Tênis de saibro" },
  { kind: "court", x: 8, z: 22, w: 18, d: 10, label: "Quadra esportiva" },
  { kind: "playground", x: 34, z: 22, w: 10, d: 8, label: "Treehouse playground" },
  { kind: "playground", x: 45, z: 22, w: 7, d: 5, label: "Acqua playground" },
  { kind: "pavilion", x: 56, z: 22, w: 10, d: 7, height: 3.4, label: "Gourmet Art" },
  { kind: "pavilion", x: 68, z: 22, w: 10, d: 7, height: 3.4, label: "Gourmet Nature" },
  { kind: "pavilion", x: 8, z: 35, w: 12, d: 7, height: 3.6, label: "Salão de festas" },
  { kind: "pavilion", x: 22, z: 35, w: 9, d: 7, height: 3.4, label: "Fitness / sauna" },
  { kind: "pavilion", x: 100, z: 22, w: 10, d: 8, height: 3.2, label: "Brinquedoteca" },
  { kind: "plaza", x: 10, z: 44, w: 20, d: 5, label: "Lobby Torre A" },
  { kind: "plaza", x: 48, z: 44, w: 20, d: 5, label: "Lobby Torre B" },
  { kind: "plaza", x: 84, z: 42, w: 16, d: 5, label: "Lobby Torre C" },
  { kind: "hedge", x: -3.4, z: -3.4, w: 0.5, d: 98, height: 1.2 },
  { kind: "hedge", x: 120.6, z: -3.4, w: 0.5, d: 98, height: 1.2 },
  { kind: "hedge", x: -3.4, z: 94, w: 124.5, d: 0.5, height: 1.2 },
  { kind: "hedge", x: -3.4, z: -3.4, w: 40, d: 0.5, height: 1.2 },
  { kind: "hedge", x: 78, z: -3.4, w: 43, d: 0.5, height: 1.2 },
  ...trees([
    [10, 4, 1.1],
    [38, 3.6, 0.95],
    [74, 3.4, 1.2],
    [104, 4, 1],
    [6, 20, 0.85],
    [32, 19, 1.05],
    [54, 20, 0.9],
    [96, 18, 1.1],
    [4, 40, 1],
    [42, 40, 0.9],
    [80, 40, 1.15],
    [108, 42, 0.95],
    [12, 78, 1.2],
    [28, 80, 0.85],
    [78, 80, 1],
    [108, 78, 1.1],
    [18, 60, 0.8],
    [42, 62, 1],
    [76, 64, 0.9],
    [110, 60, 1.05],
    [60, 34, 1.15],
    [90, 34, 0.85],
  ]),
];

const TOWER_A_FLOORS: FloorPlan[] = [
  {
    id: "park-a-0",
    name: "Torre A · Garden",
    level: 0,
    units: [unitGarden("0-g1", "G1", 0.4, 0.4, "g1"), unitGarden("0-g2", "G2", 16.2, 0.4, "g2")],
  },
  ...[1, 2, 3, 4, 5, 6].map(floor141),
  ...[7, 8, 9, 10, 11, 12].map(floor170),
];

const TOWER_C_FLOORS: FloorPlan[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(floor219);

const TOWERS: SiteTower[] = [
  {
    id: "tower-a",
    name: "Torre A",
    x: 8,
    z: 48,
    width: 32.4,
    depth: 30.8,
    floorHeight: 3.1,
    unitsPerFloor: 4,
    stories: 13,
    detailed: true,
    floors: TOWER_A_FLOORS,
  },
  {
    id: "tower-b",
    name: "Torre B",
    x: 46,
    z: 48,
    width: 32.4,
    depth: 30.8,
    floorHeight: 3.1,
    unitsPerFloor: 4,
    stories: 13,
    detailed: false,
    floors: [],
  },
  {
    id: "tower-c",
    name: "Torre C",
    x: 84,
    z: 46,
    width: 19.8,
    depth: 34.2,
    floorHeight: 3.1,
    unitsPerFloor: 2,
    stories: 13,
    detailed: true,
    floors: TOWER_C_FLOORS,
  },
];

export const THE_PARK_DROR: BuildingPlan = {
  id: "park-dror",
  name: "The Park Inspired by Dror",
  neighborhood: "Rio Branco, Porto Alegre",
  description:
    "Arte, design e arquitetura. Três torres da Cyrela com Studio Dror, no Rio Branco, junto ao Parcão e ao Moinhos de Vento.",
  floorHeight: 3.1,
  width: 32.4,
  depth: 30.8,
  floors: TOWER_A_FLOORS,
  towers: TOWERS,
  landscape: PARK_LANDSCAPE,
  facts: {
    developer: "Cyrela Goldsztein",
    design: "Studio Dror · Dror Benshetrit",
    status: "Pronto para morar",
    address: "R. Cel. Paulino Teixeira, 190",
    city: "Porto Alegre · RS",
    launch: "Janeiro 2021",
    delivered: "Julho 2025",
    lotM2: 10809,
    privateM2: 22787,
    towers: 3,
    residences: 133,
    floorsLabel: "Térreo + 12 andares",
    parking: "2 a 3 vagas",
    suitesLabel: "3 suítes",
    areaRange: "141 a 227 m²",
  },
  amenities: [
    "Piscina externa com raia de 25 m",
    "Piscina infantil",
    "Piscina coberta aquecida",
    "Sauna seca",
    "Fitness",
    "Espaço Gourmet Art",
    "Espaço Gourmet Nature",
    "Salão de festas",
    "Sala de jogos",
    "Rooftop lounge nas 3 torres",
    "Quadra de tênis de saibro",
    "Quadra esportiva",
    "Brinquedoteca",
    "Acqua playground",
    "Treehouse playground",
    "Lobby com pé-direito duplo",
    "Paisagismo em todo o condomínio",
  ],
};
