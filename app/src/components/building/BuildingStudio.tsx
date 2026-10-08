"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Box, Home, Pause, Play, Rotate3d, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { FloorPlan2D } from "@/components/building/FloorPlan2D";
import {
  APARTMENT_META,
  BUILDINGS,
  buildingStats,
  buildingTowers,
  getBuilding,
  listUnits,
  uniqueTypes,
  type ApartmentType,
  type ViewMode,
} from "@/lib/buildings";
import { cn } from "@/lib/utils";
import { tourPhase, type ViewPreset } from "@/components/building/BuildingScene";

const BuildingScene = dynamic(
  () => import("./BuildingScene").then((m) => m.BuildingScene),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted">Preparing the building…</div> },
);

const PHASE_COPY: Record<string, string> = {
  plan: "Lendo a planta 2D",
  rise: "Levantando a maquete 3D",
  orbit: "Girando 360° no condomínio",
  options: "Mostrando as opções de imóvel",
  hold: "Escolha um imóvel para orbitar",
};

const VIEW_COPY: Record<ViewMode, string> = {
  site: "Maquete do condomínio · 360°",
  building: "Órbita 360° no prédio",
  unit: "Girando no eixo do imóvel",
};

const PRESETS: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Isométrica" },
  { id: "front", label: "Frente" },
  { id: "side", label: "Lateral" },
  { id: "back", label: "Fundo" },
  { id: "top", label: "Alto" },
];

export function BuildingStudio() {
  const [buildingId, setBuildingId] = useState(BUILDINGS[0].id);
  const building = useMemo(() => getBuilding(buildingId), [buildingId]);
  const towers = buildingTowers(building);
  const [towerId, setTowerId] = useState(towers[0].id);
  const [floorId, setFloorId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tourKey, setTourKey] = useState(0);
  const [showLandscape, setShowLandscape] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("site");
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [preset, setPreset] = useState<ViewPreset | null>(null);

  const activeTower = towers.find((t) => t.id === towerId) ?? towers.find((t) => t.detailed) ?? towers[0];
  const towerFloors = activeTower.floors;

  function chooseBuilding(id: string) {
    setBuildingId(id);
    const next = getBuilding(id);
    const nextTowers = buildingTowers(next);
    const first = nextTowers.find((t) => t.detailed) ?? nextTowers[0];
    setTowerId(first.id);
    setFloorId((first.floors[0] ?? next.floors[0]).id);
    setSelectedId(null);
    setProgress(0);
    setPlaying(true);
    setViewMode("site");
    setAutoOrbit(false);
    setPreset(null);
    setTourKey((k) => k + 1);
  }

  function chooseTower(id: string) {
    const next = towers.find((t) => t.id === id);
    if (!next) return;
    setTowerId(id);
    if (next.floors[0]) setFloorId(next.floors[0].id);
    setSelectedId(null);
    setViewMode("building");
    setAutoOrbit(true);
    setPlaying(false);
    setPreset(null);
  }

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const startAt = progress;
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(1, startAt + (now - started) / 18000);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
      else {
        setPlaying(false);
        setAutoOrbit(true);
        setViewMode("site");
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // tourKey remounts the clock; progress is sampled when play starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, tourKey]);

  const floor = towerFloors.find((f) => f.id === floorId) ?? towerFloors[0];
  const units = listUnits(building);
  const selected = units.find((u) => u.id === selectedId) ?? null;
  const types = uniqueTypes(building);
  const phase = tourPhase(progress);
  const focusType: ApartmentType | null =
    phase === "options" || phase === "hold"
      ? types[Math.min(types.length - 1, Math.floor(Math.min(0.999, Math.max(0, progress - 0.62) / 0.28) * types.length))]
      : selected?.type ?? null;

  const visibleUnits = selected
    ? [selected]
    : focusType
      ? units.filter((u) => u.type === focusType)
      : units;

  const facts = building.facts;

  function lookAtSite() {
    setViewMode("site");
    setAutoOrbit(true);
    setPlaying(false);
    setPreset("iso");
  }

  function lookAtBuilding() {
    setViewMode("building");
    setAutoOrbit(true);
    setPlaying(false);
    setPreset("iso");
  }

  function lookAtUnit(id?: string | null) {
    const next = units.find((item) => item.id === (id ?? selectedId)) ?? units[0];
    if (!next) return;
    setSelectedId(next.id);
    setFloorId(next.floorId);
    setTowerId(next.towerId);
    setViewMode("unit");
    setAutoOrbit(true);
    setPlaying(false);
    setPreset("iso");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)]">
        <aside className="border-b border-border lg:border-r lg:border-b-0">
          <div className="px-5 py-5 md:px-6">
            <p className="text-[13px] text-muted">Maquete 3D</p>
            <h1 className="text-[22px] font-medium tracking-tight">Do plano à órbita do imóvel</h1>
            <p className="mt-2 text-[14px] leading-6 text-muted">
              Gire 360° no condomínio, no prédio ou no eixo do apartamento escolhido.
            </p>
          </div>

          <div className="space-y-6 px-5 pb-28 md:px-6 lg:pb-8">
            <section>
              <h2 className="mb-3 text-[13px] font-medium tracking-wide text-muted uppercase">Building</h2>
              <div className="space-y-2">
                {BUILDINGS.map((item) => {
                  const s = buildingStats(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseBuilding(item.id)}
                      className={cn(
                        "w-full rounded-[18px] border bg-surface px-4 py-4 text-left transition",
                        buildingId === item.id
                          ? "border-foreground/25"
                          : "border-border hover:border-border-strong",
                      )}
                    >
                      <p className="text-[16px] font-medium tracking-tight">{item.name}</p>
                      <p className="mt-1 text-[12px] text-muted">{item.neighborhood}</p>
                      <p className="mt-2 text-[12px] text-muted">
                        {typeof s.floors === "number" ? `${s.floors} floors` : s.floors}
                        {" · "}
                        {s.apartments} residências
                        {" · "}
                        {s.types} plantas
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {facts ? (
              <section className="rounded-[18px] border border-border bg-surface p-4">
                <p className="text-[12px] text-muted">{facts.status}</p>
                <h2 className="mt-1 text-[18px] font-medium tracking-tight">{building.name}</h2>
                <p className="mt-2 text-[13px] leading-6 text-muted">{building.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
                  <div>
                    <dt className="text-muted">Incorporadora</dt>
                    <dd className="font-medium">{facts.developer}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Projeto</dt>
                    <dd className="font-medium">{facts.design}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Endereço</dt>
                    <dd className="font-medium">{facts.address}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Cidade</dt>
                    <dd className="font-medium">{facts.city}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Área</dt>
                    <dd className="font-medium">{facts.areaRange}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Tipologia</dt>
                    <dd className="font-medium">{facts.suitesLabel} · {facts.parking}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Terreno</dt>
                    <dd className="font-medium">{facts.lotM2?.toLocaleString("pt-BR")} m²</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Torres</dt>
                    <dd className="font-medium">{facts.towers} · {facts.residences} unidades</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Lançamento</dt>
                    <dd className="font-medium">{facts.launch}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Entrega</dt>
                    <dd className="font-medium">{facts.delivered}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            {towers.length > 1 ? (
              <section>
                <h2 className="mb-3 text-[13px] font-medium tracking-wide text-muted uppercase">Towers</h2>
                <div className="flex flex-wrap gap-1">
                  {towers.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseTower(item.id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[12px] font-medium",
                        towerId === item.id ? "bg-foreground text-white" : "text-muted hover:bg-background",
                      )}
                    >
                      {item.name}
                      <span className="ml-1 opacity-70">
                        {item.unitsPerFloor}/andar
                      </span>
                    </button>
                  ))}
                </div>
                {!activeTower.detailed ? (
                  <p className="mt-2 text-[12px] leading-5 text-muted">
                    Massa da torre no parque. Escolha Torre A ou Torre C para abrir as plantas.
                  </p>
                ) : null}
              </section>
            ) : null}

            <section>
              <h2 className="mb-3 text-[13px] font-medium tracking-wide text-muted uppercase">Floor plate</h2>
              <div className="mb-3 flex flex-wrap gap-1">
                {towerFloors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFloorId(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] font-medium",
                      floorId === item.id ? "bg-foreground text-white" : "text-muted hover:bg-background",
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {floor ? (
                <div className="overflow-hidden rounded-[18px] border border-border">
                  <FloorPlan2D
                    building={building}
                    floor={floor}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    onSelect={(id) => lookAtUnit(id)}
                    onHover={setHoveredId}
                    showLandscape={showLandscape}
                    towerId={activeTower.id}
                  />
                </div>
              ) : (
                <p className="text-[13px] text-muted">This tower is shown as a mass on the site.</p>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-[13px] font-medium tracking-wide text-muted uppercase">Apartment options</h2>
              <div className="space-y-2">
                {types.map((type) => {
                  const meta = APARTMENT_META[type];
                  const count = units.filter((u) => u.type === type).length;
                  const active = focusType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const first = units.find((u) => u.type === type);
                        if (first) lookAtUnit(first.id);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left",
                        active ? "border-foreground/20 bg-accent-soft" : "border-border bg-surface",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                        <span className="text-[13px] font-medium leading-4">{meta.label}</span>
                      </span>
                      <span className="ml-2 shrink-0 text-[12px] text-muted">{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {building.amenities?.length ? (
              <section>
                <h2 className="mb-3 text-[13px] font-medium tracking-wide text-muted uppercase">Lazer e condomínio</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {building.amenities.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <Toggle
              checked={showLandscape}
              onCheckedChange={setShowLandscape}
              label="Landscape"
              description="Lawns, paths, hedges, trees, courts and gardens around the building."
            />

            {selected ? (
              <section className="rounded-[18px] border border-border bg-surface p-4">
                <p className="text-[12px] text-muted">
                  {selected.towerName} · {selected.floorName} · {APARTMENT_META[selected.type].label}
                </p>
                <h3 className="mt-1 text-[20px] font-medium tracking-tight">Apartamento {selected.name}</h3>
                <p className="mt-2 text-[14px] text-muted">
                  {selected.areaM2} m²
                  {" · "}
                  {selected.suites ?? selected.bedrooms} suítes
                  {" · "}
                  {selected.parking ? `${selected.parking} vagas` : selected.bedrooms === 0 ? "Open plan" : `${selected.bedrooms} bedroom${selected.bedrooms > 1 ? "s" : ""}`}
                </p>
                {selected.highlights?.length ? (
                  <ul className="mt-3 space-y-1 text-[13px] text-muted">
                    {selected.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                <Button className="mt-4 w-full" onClick={() => lookAtUnit(selected.id)}>
                  <Home className="size-4" /> Ver imóvel e girar no eixo
                </Button>
              </section>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-[460px] flex-col bg-[#f4efe8] p-3 md:p-5">
          <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-[24px] bg-[#f7f3ee]">
            <BuildingScene
              building={building}
              progress={progress}
              playing={playing}
              selectedId={selectedId}
              hoveredId={hoveredId}
              showLandscape={showLandscape}
              viewMode={playing ? "site" : viewMode}
              towerId={towerId}
              autoOrbit={autoOrbit}
              preset={playing ? null : preset}
              onSelect={(id) => {
                if (id) lookAtUnit(id);
                else setSelectedId(null);
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
              <p className="rounded-full border border-border bg-white/90 px-4 py-2 text-[13px] font-medium shadow-[0_8px_24px_rgba(34,34,34,0.06)]">
                {playing ? PHASE_COPY[phase] : VIEW_COPY[viewMode]}
              </p>
            </div>
            <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2 md:inset-x-4 md:bottom-4">
              <div className="pointer-events-auto flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={lookAtSite}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium",
                    !playing && viewMode === "site"
                      ? "border-foreground/20 bg-foreground text-white"
                      : "border-border bg-white/92 text-foreground",
                  )}
                >
                  <Box className="size-3.5" /> Maquete
                </button>
                <button
                  type="button"
                  onClick={lookAtBuilding}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium",
                    !playing && viewMode === "building"
                      ? "border-foreground/20 bg-foreground text-white"
                      : "border-border bg-white/92 text-foreground",
                  )}
                >
                  <Rotate3d className="size-3.5" /> 360° do prédio
                </button>
                <button
                  type="button"
                  onClick={() => lookAtUnit()}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium",
                    !playing && viewMode === "unit"
                      ? "border-foreground/20 bg-foreground text-white"
                      : "border-border bg-white/92 text-foreground",
                  )}
                >
                  <Home className="size-3.5" /> Ver imóvel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setAutoOrbit((value) => !value);
                    setPreset(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium",
                    autoOrbit && !playing
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-white/92 text-foreground",
                  )}
                >
                  <RotateCcw className="size-3.5" /> Girar no eixo
                </button>
              </div>
              <div className="pointer-events-auto flex flex-wrap gap-1">
                {PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setPreset(item.id);
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      preset === item.id ? "bg-foreground text-white" : "bg-white/88 text-muted",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted">
              <span>{visibleUnits.length} homes in view</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setProgress(0);
                setSelectedId(null);
                setPlaying(true);
                setViewMode("site");
                setAutoOrbit(false);
                setPreset(null);
                setTourKey((k) => k + 1);
              }}
            >
              <RotateCcw className="size-4" /> Replay
            </Button>
            <Button
              onClick={() => {
                if (progress >= 1) {
                  setProgress(0);
                  setPlaying(true);
                  return;
                }
                setPlaying((p) => !p);
              }}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? "Pause tour" : progress >= 1 ? "Play tour" : "Resume"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
