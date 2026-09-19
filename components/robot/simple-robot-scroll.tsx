"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { robotSystems } from "@/data/robot";
import LineSidebar from "./LineSidebar";

const CMS_MODEL = "/api/robot-assets/model";
const LOCAL_MODEL = "/robot/models/2026-robot-hierarchical.glb";
const ASSEMBLED_Z = 125.25;
const DESKTOP_ASSEMBLED_SCALE = 0.24;
const COLOR_WINDOW = 1 / robotSystems.length;
const COLOR_FADE = 0.08;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
// The section is sticky-pinned for the whole 700/950vh scroll track, but only the middle
// slice of that track should actually drive the animation — this is how much is reserved
// as dead space at the very top/bottom before/after progress starts moving.
const RAW_BUFFER = 0.05;
const RAW_SPAN = 1 - RAW_BUFFER * 2;
const invertSmoothstep = (target: number) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (smoothstep(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// The timeline bookends the 5 real subsystems with a head-on "Start" and "End" pose.
const TIMELINE_STATES = [
  { id: "start", name: "Start" },
  ...robotSystems.map((sys) => ({ id: sys.id, name: sys.name })),
  { id: "end", name: "End" },
];
const STATE_COUNT = TIMELINE_STATES.length;
// Start/End are just a brief resting pose, not something to linger on — give each subsystem
// the full share of scroll and let the bookends pass quickly, instead of splitting evenly.
const STATE_WEIGHTS = [0.55, ...robotSystems.map(() => 1), 0.55];
const STATE_WEIGHT_TOTAL = STATE_WEIGHTS.reduce((a, b) => a + b, 0);
const STATE_BOUNDS = STATE_WEIGHTS.reduce<number[]>((bounds, w) => {
  bounds.push(bounds[bounds.length - 1] + w / STATE_WEIGHT_TOTAL);
  return bounds;
}, [0]);
const stateIndexAt = (progress: number) => {
  for (let i = 0; i < STATE_COUNT; i++) {
    if (progress < STATE_BOUNDS[i + 1]) return i;
  }
  return STATE_COUNT - 1;
};

// Per-state camera orbit, as absolute rig angles: z spins the robot to bring that subsystem
// forward, x tilts it to show top/underside where useful (drivetrain viewed from below,
// electronics from above). Start/End use a true head-on angle, not the 3/4 "assembled hero"
// angle the subsystem shots are built from.
type RotationKeyframe = { z: number; x: number };
const HEAD_ON_Z = 90;
const ROTATION_KEYFRAMES: RotationKeyframe[] = [
  { z: HEAD_ON_Z, x: 0 }, // start
  { z: ASSEMBLED_Z - 42, x: 0 }, // intake
  { z: ASSEMBLED_Z + 42, x: 0 }, // hopper
  { z: ASSEMBLED_Z + 92, x: 0 }, // shooter
  { z: ASSEMBLED_Z - 20, x: 50 }, // drivetrain — tilt to show the underside
  { z: ASSEMBLED_Z - 70, x: -50 }, // electronics — tilt to show the topside
  { z: HEAD_ON_Z, x: 0 }, // end
];
// Each state holds its pose for the middle stretch of its own window, and only blends into
// the next/previous pose over this fraction of the window at each edge — without a hold,
// the rig is perpetually mid-turn and never reads as "arriving" at any one subsystem.
const ROTATION_TRANSITION = 0.35;
const lerpKeyframe = (a: RotationKeyframe, b: RotationKeyframe, t: number): RotationKeyframe => ({
  z: THREE.MathUtils.lerp(a.z, b.z, t),
  x: THREE.MathUtils.lerp(a.x, b.x, t),
});
const rotationKeyframeAt = (progress: number): RotationKeyframe => {
  const idx = stateIndexAt(progress);
  const windowStart = STATE_BOUNDS[idx];
  const windowWidth = STATE_BOUNDS[idx + 1] - windowStart;
  const localT = clamp((progress - windowStart) / windowWidth);
  const curr = ROTATION_KEYFRAMES[idx];
  if (localT < ROTATION_TRANSITION && idx > 0) {
    const t = smoothstep(localT / ROTATION_TRANSITION);
    return lerpKeyframe(ROTATION_KEYFRAMES[idx - 1], curr, t);
  }
  if (localT > 1 - ROTATION_TRANSITION && idx < STATE_COUNT - 1) {
    const t = smoothstep((localT - (1 - ROTATION_TRANSITION)) / ROTATION_TRANSITION);
    return lerpKeyframe(curr, ROTATION_KEYFRAMES[idx + 1], t);
  }
  return curr;
};

type AnimatedPart = { node: THREE.Object3D; position: THREE.Vector3; quaternion: THREE.Quaternion; offset: THREE.Vector3 };
type TintedMaterial = { material: THREE.MeshStandardMaterial; baseOpacity: number };

export function SimpleRobotScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollToRef = useRef<(id: string) => void>(() => {});
  const lastActiveIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const host = canvasRef.current;
    if (!section || !host) return;
    let disposed = false;
    let raf = 0;
    let queued = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let envRenderTarget: THREE.WebGLRenderTarget | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let paintFrame = () => {};
    const controller = new AbortController();
    const schedule = () => {
      if (queued || disposed) return;
      queued = true;
      raf = requestAnimationFrame(() => { queued = false; paintFrame(); });
    };

    void (async () => {
      if (disposed) return;
      const scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.replaceChildren(renderer.domElement);
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();
      const camera = new THREE.PerspectiveCamera(66.1, 1, 0.1, 1000);
      camera.position.set(0, -13.3, 0.025);
      camera.lookAt(0, 0, 0);
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      const assembledScale = mobile ? 0.18 : DESKTOP_ASSEMBLED_SCALE;
      const rig = new THREE.Group();
      rig.position.set(0, -0.3, -0.15);
      rig.rotation.z = THREE.MathUtils.degToRad(ASSEMBLED_Z);
      rig.scale.setScalar(assembledScale);
      scene.add(rig);
      const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(35, -35, 48);
      const fill = new THREE.HemisphereLight(0xdce8e3, 0x172421, 1.0);
      const rim = new THREE.DirectionalLight(0x78d66a, 0.6); rim.position.set(-28, 30, 24);
      const bounce = new THREE.DirectionalLight(0xbfd8ff, 0.35); bounce.position.set(10, 25, -30);
      scene.add(key, fill, rim, bounce);
      const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
      const parse = (buffer: ArrayBuffer) => new Promise<import("three/examples/jsm/loaders/GLTFLoader.js").GLTF>((resolve, reject) => loader.parse(buffer, "", resolve, reject));
      const loadModel = async () => {
        let lastError: unknown;
        for (const url of [CMS_MODEL, LOCAL_MODEL]) {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${url} returned ${response.status}`);
            return await parse(await response.arrayBuffer());
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError instanceof Error ? lastError : new Error("Robot GLB unavailable");
      };
      try {
        const gltf = await loadModel();
        if (disposed) return;
        const robot = gltf.scene;
        robot.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(robot);
        const size = bounds.getSize(new THREE.Vector3());
        robot.position.sub(bounds.getCenter(new THREE.Vector3()));
        rig.add(robot);
        section.dataset.modelLoaded = "true";

        robot.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            const m = mat as THREE.MeshStandardMaterial;
            if (!m.isMeshStandardMaterial) continue;
            m.envMapIntensity = 1.1;
            const isLexan = /polycarbonate|lexan/i.test(m.name ?? "");
            if (isLexan) {
              m.transparent = true;
              m.opacity = 0.42;
              m.depthWrite = false;
              m.side = THREE.DoubleSide;
              m.roughness = Math.min(m.roughness, 0.15);
              m.metalness = 0;
              m.envMapIntensity = 1.6;
            }
            m.needsUpdate = true;
          }
        });

        const parts: AnimatedPart[] = [];
        const groups: Record<string, THREE.Object3D[]> = {};
        const register = (id: string, node: THREE.Object3D | undefined, offset: THREE.Vector3) => {
          if (!node) return false;
          robot.updateMatrixWorld(true);
          robot.attach(node);
          parts.push({ node, position: node.position.clone(), quaternion: node.quaternion.clone(), offset });
          (groups[id] ??= []).push(node);
          return true;
        };
        const named = (name: string) => robot.getObjectByName(name);
        const spread = mobile ? 0.24 : 0.90;
        const intake = register("intake", named("Intake_v78_1") ?? named("Intake_v78"), new THREE.Vector3(-size.x * 0.72, 0, -size.z * 0.12).multiplyScalar(spread));
        const hopper = register("hopper", named("Extendable_Hopper_v19_1") ?? named("Extendable_Hopper_v19"), new THREE.Vector3(size.x * 0.68, size.y * 0.08, size.z * 0.18).multiplyScalar(spread));
        const shooter = register("shooter", named("Shooter_v3_v42_1") ?? named("Shooter_v3_v42"), new THREE.Vector3(size.x * 0.10, 0, size.z * 0.82).multiplyScalar(spread));
        const electronics = register("electronics", named("Electrical_Board_1") ?? named("Electrical_Board"), new THREE.Vector3(-size.x * 0.08, -size.y * 0.05, -size.z * 0.50).multiplyScalar(spread));
        const modules: THREE.Object3D[] = [];
        robot.traverse((node) => { if (node.name.startsWith("Inverted_MK4i_Swerve_Module_v6") && node.children.length > 20) modules.push(node); });
        modules.sort((a, b) => a.name.localeCompare(b.name));
        const moduleOffsets = [[-size.x*.65,-size.y*.12,-size.z*.38],[-size.x*.22,size.y*.12,-size.z*.43],[size.x*.22,-size.y*.12,-size.z*.43],[size.x*.65,size.y*.12,-size.z*.38]] as const;
        modules.slice(0,4).forEach((node,index)=>register("drivetrain", node,new THREE.Vector3(...moduleOffsets[index]).multiplyScalar(spread)));
        const subsystemCount = Number(intake)+Number(hopper)+Number(shooter)+Number(electronics)+Number(modules.length===4);
        section.dataset.subsystemCount=String(subsystemCount);
        section.dataset.swerveCount=String(modules.length);
        section.dataset.robotReady=String(subsystemCount===5&&modules.length===4);

        const tintedBySubsystem: Record<string, TintedMaterial[]> = {};
        for (const sys of robotSystems) {
          const tinted: TintedMaterial[] = [];
          for (const node of groups[sys.id] ?? []) {
            node.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (!mesh.isMesh) return;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              const cloned = mats.map((m) => m.clone());
              mesh.material = cloned.length === 1 ? cloned[0] : cloned;
              for (const m of cloned as THREE.MeshStandardMaterial[]) {
                // Reference look (HighTide) fades an inactive subsystem toward a ghostly
                // translucency, not a desaturated color — so animate opacity, not hue.
                // Depth-write stays on so the mesh still self-occludes normally instead of
                // letting every internal strut/bolt blend into a muddy X-ray soup.
                const baseOpacity = m.opacity ?? 1;
                m.transparent = true;
                tinted.push({ material: m, baseOpacity });
              }
            });
          }
          tintedBySubsystem[sys.id] = tinted;
        }

        const scrollToSubsystem = (id: string) => {
          const i = TIMELINE_STATES.findIndex((s) => s.id === id);
          if (i < 0) return;
          const targetProgress = (STATE_BOUNDS[i] + STATE_BOUNDS[i + 1]) / 2;
          const raw = RAW_BUFFER + invertSmoothstep(targetProgress) * RAW_SPAN;
          const distance = Math.max(1, section.offsetHeight - window.innerHeight);
          window.scrollTo({ top: section.offsetTop + raw * distance, behavior: "smooth" });
        };
        scrollToRef.current = scrollToSubsystem;

        const resize = () => {
          const rect=host.getBoundingClientRect(); camera.aspect=rect.width/Math.max(1,rect.height); camera.fov=mobile?78:66.1;
          camera.updateProjectionMatrix(); renderer?.setSize(rect.width,rect.height,false); schedule();
        };
        paintFrame=()=>{
          const distance=Math.max(1,section.offsetHeight-window.innerHeight);
          const raw=clamp((window.scrollY-section.offsetTop)/distance);
          const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const progress=reduced?(raw<.5?0:1):smoothstep(clamp((raw-RAW_BUFFER)/RAW_SPAN));
          // Explosion/reveal stays flat during the Start and End bookend windows, and sweeps
          // 0→1 across the 5 real subsystems in between, so nothing separates until you've
          // scrolled past "Start" and everything is settled by the time you reach "End".
          const explosion = reduced ? progress : clamp((progress - STATE_BOUNDS[1]) / (STATE_BOUNDS[STATE_COUNT - 1] - STATE_BOUNDS[1]));
          const rot = reduced ? ROTATION_KEYFRAMES[0] : rotationKeyframeAt(progress);
          const tiltScale = mobile ? 0.6 : 1;
          rig.rotation.set(
            THREE.MathUtils.degToRad(rot.x * tiltScale),
            0,
            THREE.MathUtils.degToRad(rot.z)
          );
          rig.position.x=mobile?-explosion*0.35:0;
          rig.scale.setScalar(assembledScale);
          const inverseRigRotation=rig.quaternion.clone().invert();
          for(const part of parts){
            const localOffset=part.offset.clone().applyQuaternion(inverseRigRotation);
            part.node.position.copy(part.position).addScaledVector(localOffset,explosion);
            part.node.quaternion.copy(part.quaternion);
          }
          robotSystems.forEach((sys, i) => {
            const winStart = i * COLOR_WINDOW;
            const amount = clamp((explosion - winStart) / COLOR_FADE);
            for (const t of tintedBySubsystem[sys.id] ?? []) t.material.opacity = THREE.MathUtils.lerp(t.baseOpacity * 0.22, t.baseOpacity, amount);
          });
          const stateIdx = stateIndexAt(progress);
          section.dataset.activeSubsystem = TIMELINE_STATES[stateIdx].id;
          if (stateIdx !== lastActiveIndexRef.current) {
            lastActiveIndexRef.current = stateIdx;
            setActiveIndex(stateIdx);
          }
          section.dataset.explosionProgress=explosion.toFixed(3); renderer?.render(scene,camera);
        };
        window.addEventListener("scroll",schedule,{passive:true, signal: controller.signal});
        resizeObserver=new ResizeObserver(resize); resizeObserver.observe(host); resize(); schedule();
      } catch(error) {
        section.dataset.robotReady="false";
        section.dataset.robotError=error instanceof Error?error.message:"Unknown model error";
      }
    })();
    return()=>{disposed=true;cancelAnimationFrame(raf);controller.abort();resizeObserver?.disconnect();envRenderTarget?.dispose();renderer?.dispose();host.replaceChildren()};
  },[]);

  return (
    <section className="robot-scroll" ref={sectionRef} aria-label="Interactive 2026 robot model">
      <div className="robot-scroll__stage">
        <div className="robot-scroll__canvas-host" ref={canvasRef} />
        <div className="robot-scroll__timeline">
          <LineSidebar
            items={TIMELINE_STATES.map((s) => s.name)}
            activeIndex={activeIndex}
            onItemClick={(index) => scrollToRef.current(TIMELINE_STATES[index].id)}
          />
        </div>
      </div>
    </section>
  );
}
