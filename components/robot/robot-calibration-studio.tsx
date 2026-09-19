"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MathUtils } from "three";
import type { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Vec3 = [number, number, number];

type Calibration = {
  position: Vec3;
  rotation: Vec3;
  scale: number;
  camera: Vec3;
  target: Vec3;
  fov: number;
  exposure: number;
  modelOpacity: number;
};

const STORAGE_KEY = "radicubs-robot-calibration-v1";
const DEFAULTS: Calibration = {
  position: [0, -0.3, -0.15],
  rotation: [0, 0, 125.25],
  scale: 0.11,
  camera: [0, -13.3, 0.025],
  target: [0, 0, 0],
  fov: 66.1,
  exposure: 1.05,
  modelOpacity: 1,
};

const fmt = (value: number) => Number(value.toFixed(3));

function NumberSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="cal-control">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <input
        aria-label={`${label} value`}
        className="cal-value"
        type="number"
        min={min}
        max={max}
        step={step}
        value={fmt(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function VectorControls({
  title,
  values,
  min,
  max,
  step,
  units = "",
  onChange,
}: {
  title: string;
  values: Vec3;
  min: number;
  max: number;
  step: number;
  units?: string;
  onChange: (values: Vec3) => void;
}) {
  const axes = ["X", "Y", "Z"] as const;
  return (
    <fieldset className="cal-fieldset">
      <legend>{title}</legend>
      {axes.map((axis, index) => (
        <NumberSlider
          key={axis}
          label={`${axis}${units}`}
          value={values[index]}
          min={min}
          max={max}
          step={step}
          onChange={(value) => {
            const next = [...values] as Vec3;
            next[index] = value;
            onChange(next);
          }}
        />
      ))}
    </fieldset>
  );
}

export function RobotCalibrationStudio({ backgroundUrl, modelUrl }: { backgroundUrl?: string; modelUrl?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelGroupRef = useRef<Group | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const hasAutoloadedRef = useRef(false);
  const [calibration, setCalibration] = useState<Calibration>(DEFAULTS);
  const [plateUrl, setPlateUrl] = useState<string | null>(backgroundUrl ?? null);
  const [modelName, setModelName] = useState("No CAD model loaded");
  const [status, setStatus] = useState("Load the robot-removed field plate, then load the FBX or GLB.");
  const [showGrid, setShowGrid] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rendererReady, setRendererReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      setCalibration({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let stopped = false;

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (stopped || !canvasRef.current || !stageRef.current) return;

      const scene = new THREE.Scene();
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      canvasRef.current.replaceChildren(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(DEFAULTS.fov, 16 / 9, 0.1, 1000);
      const modelGroup = new THREE.Group();
      const key = new THREE.DirectionalLight(0xffffff, 2.3);
      key.position.set(35, -35, 48);
      const fill = new THREE.HemisphereLight(0xdce8e3, 0x172421, 1.35);
      const rim = new THREE.DirectionalLight(0x78d66a, 0.75);
      rim.position.set(-28, 30, 24);
      const grid = new THREE.GridHelper(72, 18, 0x3a6642, 0x1b2f21);
      grid.rotation.x = Math.PI / 2;
      grid.position.z = -12;
      grid.name = "calibration-grid";
      scene.add(key, fill, rim, grid, modelGroup);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = true;
      controls.minDistance = 14;
      controls.maxDistance = 220;
      controls.addEventListener("end", () => {
        setCalibration((current) => ({
          ...current,
          camera: [fmt(camera.position.x), fmt(camera.position.y), fmt(camera.position.z)],
          target: [fmt(controls.target.x), fmt(controls.target.y), fmt(controls.target.z)],
          fov: fmt(camera.fov),
        }));
      });

      const resize = () => {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height, false);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(stageRef.current);
      resize();

      let frame = 0;
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      animate();

      modelGroupRef.current = modelGroup;
      cameraRef.current = camera;
      controlsRef.current = controls;
      rendererRef.current = renderer;
      sceneRef.current = scene;
      setRendererReady(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        controls.dispose();
        renderer.dispose();
        canvasRef.current?.replaceChildren();
        setRendererReady(false);
      };
    })();

    return () => {
      stopped = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const modelGroup = modelGroupRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const controls = controlsRef.current;
    if (!modelGroup || !camera || !renderer || !scene || !controls) return;
    modelGroup.position.set(...calibration.position);
    modelGroup.rotation.set(
      MathUtils.degToRad(calibration.rotation[0]),
      MathUtils.degToRad(calibration.rotation[1]),
      MathUtils.degToRad(calibration.rotation[2]),
    );
    modelGroup.scale.setScalar(calibration.scale);
    camera.position.set(...calibration.camera);
    camera.fov = calibration.fov;
    controls.target.set(...calibration.target);
    controls.update();
    camera.updateProjectionMatrix();
    renderer.toneMappingExposure = calibration.exposure;
    scene.getObjectByName("calibration-grid")!.visible = showGrid;
    modelGroup.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(Boolean);
      materials.forEach((material) => {
        material.transparent = calibration.modelOpacity < 1;
        material.opacity = calibration.modelOpacity;
        material.needsUpdate = true;
      });
    });
  }, [calibration, showGrid]);

  const loadPlate = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (plateUrl) URL.revokeObjectURL(plateUrl);
    setPlateUrl(URL.createObjectURL(file));
    setStatus(`Field plate loaded: ${file.name}`);
  };

  const loadModelFile = useCallback(async (file: File) => {
    const modelGroup = modelGroupRef.current;
    setModelName(file.name);
    setIsLoading(true);
    if (!modelGroup) {
      setIsLoading(false);
      setStatus("The 3D stage is still initializing. Wait one moment, then choose the CAD file again.");
      return;
    }
    setStatus(`Reading ${file.name}. The original CAD is dense, so this can take a moment.`);
    setIsLoaded(false);
    try {
      const THREE = await import("three");
      const buffer = await file.arrayBuffer();
      const extension = file.name.split(".").pop()?.toLowerCase();
      let loaded: Group;
      if (extension === "glb") {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
        loaded = await new Promise<Group>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.setMeshoptDecoder(MeshoptDecoder);
          loader.parse(buffer, "", (gltf) => resolve(gltf.scene), reject);
        });
      } else if (extension === "fbx") {
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
        loaded = new FBXLoader().parse(buffer, "");
      } else {
        throw new Error("Choose an .fbx or .glb model file.");
      }
      loaded.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(loaded);
      const center = box.getCenter(new THREE.Vector3());
      loaded.position.sub(center);
      loaded.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(Boolean);
        materials.forEach((material) => {
          if ((material.name ?? "").toLowerCase().includes("polycarbonate")) {
            material.transparent = true;
            material.opacity = 0.38;
            material.depthWrite = false;
          }
          material.side = THREE.DoubleSide;
        });
      });
      modelGroup.clear();
      modelGroup.add(loaded);
      setModelName(file.name);
      setStatus("CAD model loaded. Use camera, pose, and scale controls until it sits exactly over the plate.");
      setIsLoaded(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setStatus(`Could not load this file: ${error instanceof Error ? error.message : "unknown model error"}`);
    }
  }, []);

  const loadModel = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadModelFile(file);
  };

  useEffect(() => {
    if (!modelUrl || !rendererReady || hasAutoloadedRef.current) return;
    hasAutoloadedRef.current = true;
    void (async () => {
      try {
        setStatus("Retrieving 2026-robot-hierarchical.glb from Strapi.");
        const response = await fetch(modelUrl);
        if (!response.ok) throw new Error(`CMS returned ${response.status}`);
        const blob = await response.blob();
        await loadModelFile(new File([blob], "2026-robot-hierarchical.glb", { type: "model/gltf-binary" }));
      } catch (error) {
        setIsLoading(false);
        setStatus(`The CMS robot model could not load: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    })();
  }, [loadModelFile, modelUrl, rendererReady]);

  const saveCalibration = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration));
    setStatus("Calibration saved in this browser. Copy the JSON when you are ready to wire it into the scroll scene.");
  };

  const copyCalibration = async () => {
    await navigator.clipboard.writeText(JSON.stringify(calibration, null, 2));
    setStatus("Calibration JSON copied.");
  };

  const resetCalibration = () => {
    setCalibration(DEFAULTS);
    setStatus("Calibration reset to the neutral CAD view.");
  };

  return (
    <main className="cal-page">
      <header className="cal-header">
        <Link href="/robot" className="cal-back">Back to robot</Link>
        <div>
          <p className="cal-kicker">7503 alignment bench</p>
          <h1>Fit the real machine to the field plate.</h1>
        </div>
        <p className="cal-status" role="status">{status}</p>
      </header>

      <section className="cal-workspace" aria-label="Robot model alignment workspace">
        <div className="cal-stage" ref={stageRef}>
          {plateUrl ? <img className="cal-plate" src={plateUrl} alt="Robot-removed competition field plate" /> : <div className="cal-empty-plate">Load your robot-removed field image</div>}
          <div className="cal-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="cal-stage-readout">
            <span>{isLoading ? `Loading ${modelName}` : isLoaded ? modelName : "No CAD model loaded"}</span>
            <span>{isLoading ? "Importing CAD" : isLoaded ? "Live CAD" : "Waiting for CAD"}</span>
          </div>
        </div>

        <aside className="cal-panel">
          <div className="cal-imports">
            <label className="cal-upload">
              <span>Field plate</span>
              <input type="file" accept="image/*" onChange={loadPlate} />
              <strong>Choose robot-removed image</strong>
            </label>
            <label className="cal-upload">
              <span>Robot CAD</span>
              <input type="file" accept=".fbx,.glb,model/fbx,model/gltf-binary,application/octet-stream" onChange={loadModel} />
              <strong>Choose robot FBX or GLB</strong>
            </label>
          </div>

          <section className="cal-section">
            <h2>Robot pose</h2>
            <VectorControls title="Screen-space and depth position" values={calibration.position} min={-45} max={45} step={0.05} onChange={(position) => setCalibration((current) => ({ ...current, position }))} />
            <VectorControls title="Rotation" values={calibration.rotation} min={-180} max={180} step={0.25} units="°" onChange={(rotation) => setCalibration((current) => ({ ...current, rotation }))} />
            <NumberSlider label="Uniform scale" value={calibration.scale} min={0.1} max={4} step={0.005} onChange={(scale) => setCalibration((current) => ({ ...current, scale }))} />
          </section>

          <section className="cal-section">
            <h2>Camera match</h2>
            <VectorControls title="Camera position" values={calibration.camera} min={-220} max={220} step={0.1} onChange={(camera) => setCalibration((current) => ({ ...current, camera }))} />
            <VectorControls title="Camera target" values={calibration.target} min={-40} max={40} step={0.05} onChange={(target) => setCalibration((current) => ({ ...current, target }))} />
            <NumberSlider label="Lens field of view" value={calibration.fov} min={12} max={80} step={0.1} onChange={(fov) => setCalibration((current) => ({ ...current, fov }))} />
          </section>

          <section className="cal-section">
            <h2>Inspection</h2>
            <NumberSlider label="Exposure" value={calibration.exposure} min={0.2} max={2.5} step={0.01} onChange={(exposure) => setCalibration((current) => ({ ...current, exposure }))} />
            <NumberSlider label="Model opacity" value={calibration.modelOpacity} min={0.15} max={1} step={0.01} onChange={(modelOpacity) => setCalibration((current) => ({ ...current, modelOpacity }))} />
            <label className="cal-toggle"><input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} /> Show calibration floor</label>
          </section>

          <div className="cal-actions">
            <button type="button" onClick={saveCalibration}>Save alignment</button>
            <button type="button" className="cal-secondary" onClick={copyCalibration}>Copy JSON</button>
            <button type="button" className="cal-tertiary" onClick={resetCalibration}>Reset</button>
          </div>
        </aside>
      </section>
    </main>
  );
}
