"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  APARTMENT_META,
  buildingTowers,
  listUnits,
  siteBounds,
  towerCenter,
  towerHeight,
  uniqueTypes,
  unitWorldBox,
  type BuildingPlan,
  type ListedUnit,
  type SiteTower,
  type ViewMode,
} from "@/lib/buildings";

export type TourPhase = "plan" | "rise" | "orbit" | "options" | "hold";
export type ViewPreset = "iso" | "front" | "side" | "back" | "top";

export function tourPhase(t: number): TourPhase {
  if (t < 0.14) return "plan";
  if (t < 0.3) return "rise";
  if (t < 0.62) return "orbit";
  if (t < 0.92) return "options";
  return "hold";
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function framingFor(
  building: BuildingPlan,
  mode: ViewMode,
  towerId: string | null,
  unit: ListedUnit | null,
) {
  const site = siteBounds(building);
  const span = Math.max(site.maxX - site.minX, site.maxZ - site.minZ);
  const towers = buildingTowers(building);
  const tower = towers.find((item) => item.id === towerId) ?? towers[0];

  if (mode === "unit" && unit) {
    const box = unitWorldBox(building, unit);
    const reach = Math.max(box.w, box.d, 8);
    return {
      target: new THREE.Vector3(box.x, box.y, box.z),
      radius: reach * 1.55 + 7,
      height: 3.4,
    };
  }

  if (mode === "building") {
    const c = towerCenter(tower);
    const reach = Math.max(tower.width, tower.depth, 16);
    return {
      target: new THREE.Vector3(c.x, c.y, c.z),
      radius: reach * 1.55 + 10,
      height: towerHeight(tower) * 0.22,
    };
  }

  return {
    target: new THREE.Vector3((site.minX + site.maxX) / 2, Math.max(4, span * 0.06), (site.minZ + site.maxZ) / 2),
    radius: Math.max(28, span * 0.52),
    height: Math.max(12, span * 0.14),
  };
}

function presetOffset(preset: ViewPreset, radius: number, height: number) {
  switch (preset) {
    case "front":
      return new THREE.Vector3(0, height, radius);
    case "back":
      return new THREE.Vector3(0, height, -radius);
    case "side":
      return new THREE.Vector3(radius, height, 0);
    case "top":
      return new THREE.Vector3(radius * 0.08, Math.max(radius * 1.15, height * 4), radius * 0.08);
    default:
      return new THREE.Vector3(radius * 0.72, height + radius * 0.22, radius * 0.72);
  }
}

function shade(opacity: number) {
  const solid = opacity >= 0.94;
  return { transparent: !solid, opacity: solid ? 1 : opacity };
}

function Facade({
  tower,
  heightScale,
  opacity,
}: {
  tower: SiteTower;
  heightScale: number;
  opacity: number;
}) {
  const stories = tower.stories;
  const fh = tower.floorHeight * heightScale;
  const h = Math.max(0.5, stories * fh);
  const w = tower.width;
  const d = tower.depth;
  const mat = shade(opacity);
  const glass = shade(opacity * 0.92);

  return (
    <group position={[tower.x, 0, tower.z]}>
      <mesh position={[w / 2, h / 2, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#e8dfd4" roughness={0.78} {...mat} />
      </mesh>
      {Array.from({ length: stories }, (_, i) => {
        const y = (i + 0.58) * fh;
        const glassH = fh * 0.4;
        const showBalcony = i > 0 && i < stories;
        return (
          <group key={i}>
            <mesh position={[w / 2, i * fh, d / 2]} receiveShadow>
              <boxGeometry args={[w + 0.18, 0.08, d + 0.18]} />
              <meshStandardMaterial color="#d4cbc0" roughness={0.7} {...mat} />
            </mesh>
            <mesh position={[w / 2, y, d + 0.05]} receiveShadow>
              <boxGeometry args={[w * 0.84, glassH, 0.07]} />
              <meshStandardMaterial color="#7f93a3" metalness={0.32} roughness={0.18} {...glass} />
            </mesh>
            <mesh position={[w / 2, y, -0.05]} receiveShadow>
              <boxGeometry args={[w * 0.84, glassH, 0.07]} />
              <meshStandardMaterial color="#7f93a3" metalness={0.32} roughness={0.18} {...glass} />
            </mesh>
            <mesh position={[-0.05, y, d / 2]} receiveShadow>
              <boxGeometry args={[0.07, glassH, d * 0.78]} />
              <meshStandardMaterial color="#7f93a3" metalness={0.32} roughness={0.18} {...glass} />
            </mesh>
            <mesh position={[w + 0.05, y, d / 2]} receiveShadow>
              <boxGeometry args={[0.07, glassH, d * 0.78]} />
              <meshStandardMaterial color="#7f93a3" metalness={0.32} roughness={0.18} {...glass} />
            </mesh>
            {showBalcony ? (
              <>
                <mesh position={[w / 2, y - glassH * 0.55, d + 0.42]} castShadow receiveShadow>
                  <boxGeometry args={[w * 0.7, 0.1, 0.72]} />
                  <meshStandardMaterial color="#d9cfc4" roughness={0.62} {...mat} />
                </mesh>
                <mesh position={[w / 2, y - glassH * 0.18, d + 0.72]} castShadow>
                  <boxGeometry args={[w * 0.7, 0.08, 0.08]} />
                  <meshStandardMaterial color="#c4b6a8" roughness={0.55} {...mat} />
                </mesh>
              </>
            ) : (
              <mesh position={[w / 2, fh * 0.7, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[w * 0.55, fh * 1.15, 0.22]} />
                <meshStandardMaterial color="#9aafb8" metalness={0.28} roughness={0.22} {...mat} />
              </mesh>
            )}
          </group>
        );
      })}
      <mesh position={[w / 2, h + 0.28, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.62, 0.42, d * 0.5]} />
        <meshStandardMaterial color="#c4a484" roughness={0.5} {...mat} />
      </mesh>
      <mesh position={[w / 2, h + 0.02, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.12, d + 0.3]} />
        <meshStandardMaterial color="#d2c6b8" roughness={0.68} {...mat} />
      </mesh>
    </group>
  );
}

function RoomInteriors({
  tower,
  progress,
  selectedId,
  hoveredId,
  focusType,
  isolate,
}: {
  tower: SiteTower;
  progress: number;
  selectedId: string | null;
  hoveredId: string | null;
  focusType: string | null;
  isolate: boolean;
}) {
  const phase = tourPhase(progress);
  const rise = ease(clamp01((progress - 0.14) / 0.16));
  const explode = phase === "options" || phase === "hold" || isolate ? ease(isolate ? 1 : clamp01((progress - 0.62) / 0.1)) : 0;
  const heightScale = isolate ? 1 : 0.045 + rise * 0.955;

  if (!tower.detailed) return null;

  return (
    <group position={[tower.x, 0, tower.z]}>
      {tower.floors.map((floor) => {
        const y = floor.level * (tower.floorHeight + explode * 1.6);
        return (
          <group key={floor.id} position={[0, y, 0]}>
            <mesh position={[tower.width / 2, 0.03, tower.depth / 2]} receiveShadow>
              <boxGeometry args={[tower.width + 0.3, 0.06, tower.depth + 0.3]} />
              <meshStandardMaterial color="#ebe4db" roughness={0.82} transparent opacity={isolate ? 0.35 : 0.7} />
            </mesh>
            {floor.units.map((unit) => {
              const meta = APARTMENT_META[unit.type];
              const isSelected = selectedId === unit.id;
              const isHovered = hoveredId === unit.id;
              const isFocus = focusType === unit.type || isSelected;
              const hidden = isolate && selectedId && !isSelected && !isHovered;
              const dimmed = Boolean(focusType) && !isFocus && !isHovered;
              if (hidden) return null;
              return unit.rooms.map((room) => (
                <mesh
                  key={room.id}
                  position={[room.x + room.w / 2, (tower.floorHeight * heightScale) / 2, room.y + room.h / 2]}
                  userData={{ unitId: unit.id }}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[Math.max(0.2, room.w - 0.1), tower.floorHeight * heightScale, Math.max(0.2, room.h - 0.1)]} />
                  <meshStandardMaterial
                    color={isSelected || isHovered ? "#E5484D" : meta.color}
                    roughness={0.42}
                    metalness={0.04}
                    transparent
                    opacity={dimmed ? 0.16 : 0.94}
                  />
                </mesh>
              ));
            })}
          </group>
        );
      })}
    </group>
  );
}

function CameraTour({
  building,
  progress,
  playing,
  controls,
}: {
  building: BuildingPlan;
  progress: number;
  playing: boolean;
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const site = siteBounds(building);
  const cx = (site.minX + site.maxX) / 2;
  const cz = (site.minZ + site.maxZ) / 2;
  const span = Math.max(site.maxX - site.minX, site.maxZ - site.minZ);
  const maxY = Math.max(...buildingTowers(building).map(towerHeight));

  useFrame(({ camera }) => {
    if (!playing) return;
    const phase = tourPhase(progress);
    const target = new THREE.Vector3(cx, maxY * 0.28, cz);
    const top = Math.max(42, span * 0.85);
    const radius = Math.max(28, span * 0.52);
    let pos: THREE.Vector3;
    if (phase === "plan") {
      pos = new THREE.Vector3(cx, top, cz + 0.4);
    } else if (phase === "rise") {
      const k = ease(clamp01((progress - 0.14) / 0.16));
      pos = new THREE.Vector3(cx + radius * 0.72 * k, top - (top - 16) * k, cz + radius * 0.72 * k);
    } else {
      const spin = clamp01((progress - 0.3) / 0.32) * Math.PI * 2;
      pos = new THREE.Vector3(cx + Math.cos(spin) * radius, 16 + maxY * 0.2, cz + Math.sin(spin) * radius);
    }
    camera.position.lerp(pos, 0.08);
    camera.lookAt(target);
    if (controls.current) {
      controls.current.target.lerp(target, 0.08);
      controls.current.update();
    }
  });
  return null;
}

function ViewRig({
  building,
  viewMode,
  towerId,
  unit,
  preset,
  playing,
  controls,
}: {
  building: BuildingPlan;
  viewMode: ViewMode;
  towerId: string | null;
  unit: ListedUnit | null;
  preset: ViewPreset | null;
  playing: boolean;
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const applied = useRef<string>("");
  const frame = framingFor(building, viewMode, towerId, unit);

  useEffect(() => {
    applied.current = "";
  }, [viewMode, towerId, unit?.id, preset]);

  useFrame(() => {
    if (playing) return;
    const key = `${viewMode}-${towerId}-${unit?.id ?? ""}-${preset ?? "iso"}`;
    if (controls.current) {
      controls.current.target.lerp(frame.target, 0.1);
    }
    if (applied.current !== key) {
      const dest = frame.target.clone().add(presetOffset(preset ?? "iso", frame.radius, frame.height));
      camera.position.lerp(dest, 0.12);
      camera.lookAt(frame.target);
      if (camera.position.distanceTo(dest) < 0.55) {
        applied.current = key;
        if (controls.current) controls.current.update();
      }
    }
  });
  return null;
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 1.1, 8]} />
        <meshStandardMaterial color="#8a6a49" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.95, 12, 10]} />
        <meshStandardMaterial color="#6b8f71" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 1.85, 0.15]} castShadow>
        <sphereGeometry args={[0.62, 10, 8]} />
        <meshStandardMaterial color="#7a9b78" roughness={0.72} />
      </mesh>
    </group>
  );
}

function SunLight({ building }: { building: BuildingPlan }) {
  const site = siteBounds(building);
  const cx = (site.minX + site.maxX) / 2;
  const cz = (site.minZ + site.maxZ) / 2;
  const span = Math.max(site.maxX - site.minX, site.maxZ - site.minZ, 40);
  const half = Math.max(48, span * 0.7);
  return (
    <directionalLight
      castShadow
      position={[cx + half * 0.75, half * 0.95, cz + half * 0.4]}
      intensity={1.65}
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.00028}
      shadow-normalBias={0.04}
      shadow-camera-near={2}
      shadow-camera-far={half * 4}
      shadow-camera-left={-half}
      shadow-camera-right={half}
      shadow-camera-top={half}
      shadow-camera-bottom={-half}
    />
  );
}

const LANDSCAPE_LOOK: Record<
  string,
  { color: string; y: number; h: number; roughness: number; metalness: number }
> = {
  lawn: { color: "#c8d5b8", y: 0.02, h: 0.06, roughness: 0.86, metalness: 0 },
  bed: { color: "#8fa37a", y: 0.03, h: 0.08, roughness: 0.82, metalness: 0 },
  hedge: { color: "#5f7d62", y: 0.55, h: 1.1, roughness: 0.8, metalness: 0 },
  pool: { color: "#8eb6c8", y: 0.06, h: 0.12, roughness: 0.15, metalness: 0.2 },
  plaza: { color: "#e4d6c5", y: 0.03, h: 0.06, roughness: 0.82, metalness: 0 },
  path: { color: "#d8cfc3", y: 0.03, h: 0.06, roughness: 0.84, metalness: 0 },
  tennis: { color: "#c4a07a", y: 0.04, h: 0.08, roughness: 0.78, metalness: 0 },
  court: { color: "#6b8f71", y: 0.04, h: 0.08, roughness: 0.76, metalness: 0 },
  playground: { color: "#c4a484", y: 0.08, h: 0.16, roughness: 0.7, metalness: 0 },
  pavilion: { color: "#d9cfc4", y: 1.6, h: 3.2, roughness: 0.65, metalness: 0.04 },
};

function Landscape({ building }: { building: BuildingPlan }) {
  const site = siteBounds(building);
  const cx = (site.minX + site.maxX) / 2;
  const cz = (site.minZ + site.maxZ) / 2;
  const span = Math.max(site.maxX - site.minX, site.maxZ - site.minZ) + 40;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.04, cz]} receiveShadow>
        <planeGeometry args={[span, span]} />
        <meshStandardMaterial color="#efe8de" />
      </mesh>
      {building.landscape.map((item, index) => {
        const key = `${item.kind}-${index}`;
        if (item.kind === "tree") {
          return <Tree key={key} x={item.x} z={item.z} scale={item.scale ?? 1} />;
        }
        const look = LANDSCAPE_LOOK[item.kind] ?? LANDSCAPE_LOOK.path;
        const w = item.w ?? 1;
        const d = item.d ?? 1;
        const h = item.kind === "hedge" || item.kind === "pavilion" ? (item.height ?? look.h) : look.h;
        const y = item.kind === "hedge" || item.kind === "pavilion" ? h / 2 : look.y;
        const casts = item.kind === "hedge" || item.kind === "pavilion" || item.kind === "playground";
        return (
          <mesh
            key={key}
            position={[item.x + w / 2, y, item.z + d / 2]}
            castShadow={casts}
            receiveShadow
          >
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={look.color} roughness={look.roughness} metalness={look.metalness} />
          </mesh>
        );
      })}
    </group>
  );
}

export function BuildingScene({
  building,
  progress,
  playing,
  selectedId,
  hoveredId,
  onSelect,
  showLandscape = true,
  viewMode = "site",
  towerId = null,
  autoOrbit = false,
  preset = null,
}: {
  building: BuildingPlan;
  progress: number;
  playing: boolean;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  showLandscape?: boolean;
  viewMode?: ViewMode;
  towerId?: string | null;
  autoOrbit?: boolean;
  preset?: ViewPreset | null;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const units = listUnits(building);
  const selected = units.find((item) => item.id === selectedId) ?? null;
  const types = uniqueTypes(building);
  const phase = tourPhase(progress);
  const optionIndex =
    phase === "options" || phase === "hold"
      ? Math.min(types.length - 1, Math.floor(clamp01((progress - 0.62) / 0.28) * types.length))
      : -1;
  const focusType = optionIndex >= 0 ? types[optionIndex] : null;
  const isolate = viewMode === "unit" && Boolean(selected);
  const showRooms = isolate || (playing && (phase === "options" || phase === "hold"));
  const facadeOpacity = showRooms ? 0.18 : 0.96;
  const rise = playing ? 0.045 + ease(clamp01((progress - 0.14) / 0.16)) * 0.955 : 1;
  const start = useMemo(() => {
    const frame = framingFor(building, "site", null, null);
    const pos = frame.target.clone().add(presetOffset("iso", frame.radius, frame.height));
    return {
      position: [pos.x, pos.y, pos.z] as [number, number, number],
      target: [frame.target.x, frame.target.y, frame.target.z] as [number, number, number],
    };
  }, [building]);

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.6]}
      camera={{ fov: 38, near: 0.2, far: 600, position: start.position }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#f7f3ee"]} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#fff4e8", "#c9b8a6", 0.38]} />
      <SunLight building={building} />
      <directionalLight position={[-28, 16, -14]} intensity={0.22} />
      <group
        onClick={(e) => {
          e.stopPropagation();
          const id = (e.object.userData as { unitId?: string }).unitId;
          if (id) onSelect(id);
        }}
      >
        {buildingTowers(building).map((tower) => (
          <group key={tower.id}>
            <Facade tower={tower} heightScale={rise} opacity={facadeOpacity} />
            {showRooms ? (
              <RoomInteriors
                tower={tower}
                progress={progress}
                selectedId={selectedId}
                hoveredId={hoveredId}
                focusType={focusType}
                isolate={isolate}
              />
            ) : null}
          </group>
        ))}
      </group>
      {showLandscape ? (
        <Landscape building={building} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[building.width / 2, -0.02, building.depth / 2]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#f3eee6" />
        </mesh>
      )}
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={200}
        enabled={!playing}
        autoRotate={!playing && autoOrbit}
        autoRotateSpeed={0.7}
        target={start.target}
      />
      <CameraTour building={building} progress={progress} playing={playing} controls={controls} />
      <ViewRig
        building={building}
        viewMode={viewMode}
        towerId={towerId}
        unit={selected}
        preset={preset}
        playing={playing}
        controls={controls}
      />
    </Canvas>
  );
}
