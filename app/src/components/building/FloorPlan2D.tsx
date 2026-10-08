"use client";

import {
  APARTMENT_META,
  buildingTowers,
  siteBounds,
  type BuildingPlan,
  type FloorPlan,
} from "@/lib/buildings";

const LANDSCAPE_FILL: Record<string, string> = {
  lawn: "#d7e2c8",
  bed: "#9aaf86",
  hedge: "#5f7d62",
  pool: "#9ec4d4",
  plaza: "#eadccb",
  path: "#ddd4c8",
  tennis: "#d2b08a",
  court: "#7a9b78",
  playground: "#d2b49a",
  pavilion: "#d8cfc4",
};

export function FloorPlan2D({
  building,
  floor,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  showLandscape = true,
  towerId,
}: {
  building: BuildingPlan;
  floor: FloorPlan;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  showLandscape?: boolean;
  towerId?: string;
}) {
  const pad = 16;
  const svgW = 420;
  const svgH = 360;
  const towers = buildingTowers(building);
  const active = towers.find((t) => t.id === towerId) ?? towers.find((t) => t.floors.some((f) => f.id === floor.id)) ?? towers[0];
  const site = showLandscape
    ? siteBounds(building)
    : {
        minX: active.x,
        minZ: active.z,
        maxX: active.x + active.width,
        maxZ: active.z + active.depth,
      };
  const siteW = Math.max(1, site.maxX - site.minX);
  const siteD = Math.max(1, site.maxZ - site.minZ);
  const scale = Math.min((svgW - pad * 2) / siteW, (svgH - pad * 2) / siteD);
  const ox = pad - site.minX * scale;
  const oy = pad - site.minZ * scale;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${floor.name} floor plan`}
    >
      <rect x="0" y="0" width={svgW} height={svgH} rx="18" fill="#f7f3ee" />
      {showLandscape &&
        building.landscape.map((item, i) => {
          if (item.kind === "tree") {
            return (
              <circle
                key={`t-${i}`}
                cx={ox + item.x * scale}
                cy={oy + item.z * scale}
                r={5 * (item.scale ?? 1)}
                fill="#6b8f71"
                opacity={0.85}
              />
            );
          }
          const x = ox + item.x * scale;
          const y = oy + item.z * scale;
          const w = (item.w ?? 1) * scale;
          const h = (item.d ?? 1) * scale;
          return (
            <g key={`l-${i}`}>
              <rect x={x} y={y} width={w} height={h} rx="3" fill={LANDSCAPE_FILL[item.kind] ?? "#e8e6e1"} />
              {item.label && w > 28 && h > 10 ? (
                <text
                  x={x + w / 2}
                  y={y + h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#3d3a37"
                  fontSize="6.5"
                  fontFamily="inherit"
                  className="pointer-events-none"
                >
                  {item.label}
                </text>
              ) : null}
            </g>
          );
        })}
      {towers.map((tower) => (
        <rect
          key={tower.id}
          x={ox + tower.x * scale}
          y={oy + tower.z * scale}
          width={tower.width * scale}
          height={tower.depth * scale}
          rx="5"
          fill={tower.id === active.id ? "#fff" : "#f3eee6"}
          stroke={tower.id === active.id ? "#c4a484" : "#ddd9d2"}
          strokeWidth={tower.id === active.id ? 1.6 : 1}
        />
      ))}
      {floor.units.map((unit) => {
        const meta = APARTMENT_META[unit.type];
        const activeUnit = selectedId === unit.id || hoveredId === unit.id;
        return (
          <g key={unit.id}>
            {unit.rooms.map((room) => (
              <rect
                key={room.id}
                x={ox + (active.x + room.x) * scale}
                y={oy + (active.z + room.y) * scale}
                width={room.w * scale}
                height={room.h * scale}
                rx="2"
                fill={activeUnit ? "#E5484D" : meta.soft}
                stroke={activeUnit ? "#E5484D" : meta.color}
                strokeWidth={activeUnit ? 1.4 : 0.8}
                className="cursor-pointer"
                onClick={() => onSelect(unit.id)}
                onMouseEnter={() => onHover(unit.id)}
                onMouseLeave={() => onHover(null)}
              />
            ))}
            <text
              x={ox + (active.x + unit.rooms[0].x + unit.rooms[0].w / 2) * scale}
              y={oy + (active.z + unit.rooms[0].y + unit.rooms[0].h / 2) * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={activeUnit ? "#fff" : "#222"}
              fontSize="10"
              fontFamily="inherit"
              className="pointer-events-none"
            >
              {unit.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
