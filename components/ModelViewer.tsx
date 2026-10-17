'use client';

/*
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

// Adapted from React Bits: https://reactbits.dev/components/model-viewer
// Local lighting, CAD orientation, keyboard controls, and bounded pixel density.
/* eslint-disable react/no-unknown-property */
import {
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject
} from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, useFBX, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

export type ModelViewerEnvironment =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse'
  | 'none';

export type ModelViewerIntro = 'rise' | 'spin' | 'fade' | 'none';

export interface ModelViewerHandle {
  reset: () => void;
  capture: (type?: string) => string | null;
}

export interface ModelViewerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  environment?: ModelViewerEnvironment;
  environmentIntensity?: number;
  environmentFiles?: string;
  modelRotation?: [number, number, number];
  exposure?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  autoRotateDelay?: number;
  dragRotate?: boolean;
  turntable?: boolean;
  zoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  hoverTilt?: number;
  float?: number;
  shadow?: boolean;
  shadowOpacity?: number;
  intro?: ModelViewerIntro;
  startAngle?: number;
  tilt?: number;
  offsetX?: number;
  offsetY?: number;
  fit?: number;
  resetOnDoubleClick?: boolean;
  className?: string;
  style?: CSSProperties;
  onModelLoaded?: () => void;
  ref?: Ref<ModelViewerHandle>;
}

type Settings = {
  autoRotate: boolean;
  autoRotateSpeed: number;
  autoRotateDelay: number;
  dragRotate: boolean;
  turntable: boolean;
  zoom: boolean;
  minZoom: number;
  maxZoom: number;
  hoverTilt: number;
  float: number;
  shadow: boolean;
  shadowOpacity: number;
  intro: ModelViewerIntro;
  startAngle: number;
  tilt: number;
  offsetX: number;
  offsetY: number;
  fit: number;
  resetOnDoubleClick: boolean;
  reducedMotion: boolean;
};

type Bounds = { scale: number; center: THREE.Vector3; radius: number; floor: number };

type Motion = {
  yaw: number;
  pitch: number;
  yawVelocity: number;
  pitchVelocity: number;
  zoom: number;
  zoomGoal: number;
  tiltX: number;
  tiltY: number;
  tiltGoalX: number;
  tiltGoalY: number;
  spinSpeed: number;
  idle: number;
  dragging: boolean;
  intro: number;
  clock: number;
  reset: { yaw: number; pitch: number } | null;
};

type ModelProps = { url: string; children: (object: THREE.Object3D) => ReactNode };

const FOV = 30;
const INTRO_SECONDS = 1.3;
const DRAG_SPEED = 0.0065;
const PITCH_LIMIT = (65 * Math.PI) / 180;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const measured = new WeakMap<THREE.Object3D, Bounds>();
const announced = new WeakSet<THREE.Object3D>();

const measure = (object: THREE.Object3D): Bounds => {
  const cached = measured.get(object);
  if (cached) return cached;
  const box = new THREE.Box3().setFromObject(object);
  const extent = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 2 / Math.max(extent.x, extent.y, extent.z, 0.0001);
  const bounds = { scale, center, radius: (extent.length() / 2) * scale, floor: (extent.y / 2) * scale };
  measured.set(object, bounds);
  return bounds;
};

// Storage serves files exactly as uploaded, so the CAD model is stored gzipped
// (.glb.gz) and unpacked here with the browser's built-in DecompressionStream.
// Plain .glb files pass straight through.
const gunzipIfNeeded = async (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer, 0, Math.min(2, buffer.byteLength));
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return buffer;
  return new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
};

const loadGzippedGltf: NonNullable<Parameters<typeof useGLTF>[3]> = loader => {
  loader.load = (url, onLoad, _onProgress, onError) => {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Model request failed (${response.status})`);
        return response.arrayBuffer();
      })
      .then(gunzipIfNeeded)
      .then(buffer => loader.parse(buffer, THREE.LoaderUtils.extractUrlBase(url), onLoad, onError))
      .catch(error => onError?.(error));
  };
};

// The site's models are meshopt-compressed, so skip Draco and its decoder download.
const GltfModel = ({ url, children }: ModelProps) => {
  const { scene } = useGLTF(url, false, true, loadGzippedGltf);
  const object = useMemo(() => scene.clone(true), [scene]);
  return children(object);
};

const FbxModel = ({ url, children }: ModelProps) => {
  const fbx = useFBX(url);
  const object = useMemo(() => fbx.clone(true), [fbx]);
  return children(object);
};

const ObjModel = ({ url, children }: ModelProps) => {
  const obj = useLoader(OBJLoader, url);
  const object = useMemo(() => obj.clone(true), [obj]);
  return children(object);
};

const Model = ({ url, children }: ModelProps) => {
  const extension = (url.split('?')[0].replace(/\.gz$/i, '').split('.').pop() ?? '').toLowerCase();
  if (extension === 'fbx') return <FbxModel url={url}>{children}</FbxModel>;
  if (extension === 'obj') return <ObjModel url={url}>{children}</ObjModel>;
  return <GltfModel url={url}>{children}</GltfModel>;
};

const Exposure = ({ value }: { value: number }) => {
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = value;
    invalidate();
  }, [gl, value, invalidate]);
  return null;
};

const Refresh = () => {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    invalidate();
  });
  return null;
};

const Lighting = ({ environment, intensity, files }: { environment: ModelViewerEnvironment; intensity: number; files?: string }) => {
  const previous = useRef(environment);
  useEffect(() => {
    previous.current = environment;
  });
  const fallback =
    previous.current !== environment && previous.current !== 'none' ? (
      <Environment preset={previous.current} environmentIntensity={intensity} />
    ) : null;
  return (
    <Suspense fallback={fallback}>
      {files ? <Environment files={files} environmentIntensity={intensity} /> : environment !== 'none' && <Environment preset={environment} environmentIntensity={intensity} />}
      <Refresh />
    </Suspense>
  );
};

const Stage = ({
  object,
  settingsRef,
  visibleRef,
  resetRef,
  lit,
  onReady
}: {
  object: THREE.Object3D;
  settingsRef: RefObject<Settings>;
  visibleRef: RefObject<boolean>;
  resetRef: RefObject<(() => void) | null>;
  lit: boolean;
  onReady?: () => void;
}) => {
  const { camera, gl, scene, size, invalidate } = useThree();
  const [compiled, setCompiled] = useState(false);
  const placeRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const fitRef = useRef<THREE.Group>(null);
  const bounds = useMemo(() => measure(object), [object]);
  const motionRef = useRef<Motion | null>(null);

  if (!motionRef.current) {
    const s = settingsRef.current;
    motionRef.current = {
      yaw: toRadians(s.startAngle),
      pitch: toRadians(s.tilt),
      yawVelocity: 0,
      pitchVelocity: 0,
      zoom: 1,
      zoomGoal: 1,
      tiltX: 0,
      tiltY: 0,
      tiltGoalX: 0,
      tiltGoalY: 0,
      spinSpeed: 0,
      idle: 0,
      dragging: false,
      intro: s.intro === 'none' ? 1 : 0,
      clock: 0,
      reset: null
    };
  }
  const motion = motionRef.current;

  useEffect(() => {
    resetRef.current = () => {
      const s = settingsRef.current;
      const yaw = toRadians(s.startAngle) + Math.round((motion.yaw - toRadians(s.startAngle)) / (Math.PI * 2)) * Math.PI * 2;
      motion.reset = { yaw, pitch: toRadians(s.tilt) };
      motion.zoomGoal = 1;
      motion.yawVelocity = motion.pitchVelocity = 0;
      motion.tiltGoalX = motion.tiltGoalY = 0;
      motion.idle = 0;
      if (s.reducedMotion) {
        motion.yaw = yaw;
        motion.pitch = toRadians(s.tilt);
        motion.zoom = 1;
        motion.reset = null;
      }
      invalidate();
    };
    return () => { resetRef.current = null; };
  }, [motion, settingsRef, resetRef, invalidate]);

  // Linking every shader on the first frame blocks the main thread for most of a second.
  // Keep the model hidden while the driver compiles them in parallel, then show it. Waits
  // for the environment map first, since it changes which shader variants are needed.
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const compile = () => {
      if (cancelled) return;
      if (lit && !scene.environment) { timer = window.setTimeout(compile, 30); return; }
      gl.compileAsync(object, camera, scene).catch(() => {}).then(() => {
        if (cancelled) return;
        setCompiled(true);
        invalidate();
      });
    };
    compile();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [object, lit, gl, camera, scene, invalidate]);

  useEffect(() => {
    if (!compiled || announced.has(object)) return;
    announced.add(object);
    onReady?.();
  }, [compiled, object, onReady]);

  useEffect(() => {
    const element = gl.domElement;
    const pointers = new Map<number, { x: number; y: number; t: number }>();
    let pinchStart = 0;
    let zoomStart = 1;

    const wake = () => invalidate();

    const onDown = (event: PointerEvent) => {
      const s = settingsRef.current;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, t: event.timeStamp });
      if (pointers.size === 2 && s.zoom) {
        const [a, b] = [...pointers.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
        zoomStart = motion.zoomGoal;
        motion.dragging = false;
      } else if (pointers.size === 1 && s.dragRotate && (event.pointerType !== 'mouse' || event.button === 0)) {
        motion.dragging = true;
        motion.yawVelocity = 0;
        motion.pitchVelocity = 0;
        element.setPointerCapture?.(event.pointerId);
        element.style.cursor = 'grabbing';
      }
      motion.idle = 0;
      wake();
    };

    const onMove = (event: PointerEvent) => {
      const s = settingsRef.current;
      const rect = element.getBoundingClientRect();
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        motion.tiltGoalX = ny * s.hoverTilt * 0.6;
        motion.tiltGoalY = nx * s.hoverTilt;
      }
      const last = pointers.get(event.pointerId);
      if (last) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        const elapsed = Math.max((event.timeStamp - last.t) / 1000, 1 / 240);
        last.x = event.clientX;
        last.y = event.clientY;
        last.t = event.timeStamp;
        if (pointers.size === 2 && s.zoom && pinchStart > 0) {
          const [a, b] = [...pointers.values()];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          motion.zoomGoal = THREE.MathUtils.clamp((zoomStart * distance) / pinchStart, s.minZoom, s.maxZoom);
        } else if (motion.dragging) {
          const m = motion;
          m.yaw += dx * DRAG_SPEED;
          m.yawVelocity = m.yawVelocity * 0.4 + ((dx * DRAG_SPEED) / elapsed) * 0.6;
          if (!s.turntable) {
            m.pitch = THREE.MathUtils.clamp(m.pitch + dy * DRAG_SPEED, -PITCH_LIMIT, PITCH_LIMIT);
            m.pitchVelocity = m.pitchVelocity * 0.4 + ((dy * DRAG_SPEED) / elapsed) * 0.6;
          }
          m.idle = 0;
        }
      }
      wake();
    };

    const onUp = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId);
      if (last && event.timeStamp - last.t > 80) {
        motion.yawVelocity = 0;
        motion.pitchVelocity = 0;
      }
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchStart = 0;
      if (pointers.size === 0) {
        motion.dragging = false;
        element.style.cursor = '';
      }
      wake();
    };

    const onLeave = () => {
      motion.tiltGoalX = 0;
      motion.tiltGoalY = 0;
      wake();
    };

    const onWheel = (event: WheelEvent) => {
      const s = settingsRef.current;
      if (!s.zoom || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      const m = motion;
      m.zoomGoal = THREE.MathUtils.clamp(m.zoomGoal * Math.exp(-event.deltaY * 0.01), s.minZoom, s.maxZoom);
      m.idle = 0;
      wake();
    };

    const onDoubleClick = () => {
      if (settingsRef.current.resetOnDoubleClick) resetRef.current?.();
    };

    // Provide the same view controls to keyboard users as pointer users.
    const onKeyDown = (event: KeyboardEvent) => {
      const step = toRadians(15);
      switch (event.key) {
        case 'ArrowLeft': motion.yaw -= step; break;
        case 'ArrowRight': motion.yaw += step; break;
        case 'ArrowUp': motion.pitch = Math.max(-PITCH_LIMIT, motion.pitch - step); break;
        case 'ArrowDown': motion.pitch = Math.min(PITCH_LIMIT, motion.pitch + step); break;
        case '+': case '=': motion.zoomGoal = Math.min(settingsRef.current.maxZoom, motion.zoomGoal * 1.15); break;
        case '-': motion.zoomGoal = Math.max(settingsRef.current.minZoom, motion.zoomGoal / 1.15); break;
        case 'Home': resetRef.current?.(); break;
        default: return;
      }
      event.preventDefault();
      motion.yawVelocity = motion.pitchVelocity = 0;
      motion.idle = 0;
      wake();
    };
    element.addEventListener('keydown', onKeyDown);
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);
    element.addEventListener('pointerleave', onLeave);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('dblclick', onDoubleClick);
    return () => {
      element.removeEventListener('keydown', onKeyDown);
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onUp);
      element.removeEventListener('pointerleave', onLeave);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('dblclick', onDoubleClick);
    };
  }, [gl, invalidate, settingsRef, resetRef, motion]);

  useFrame((_, delta) => {
    const place = placeRef.current;
    const floatGroup = floatRef.current;
    const tiltGroup = tiltRef.current;
    const spinGroup = spinRef.current;
    if (!place || !floatGroup || !tiltGroup || !spinGroup) return;
    const s = settingsRef.current;
    const m = motion;
    const dt = Math.min(delta, 0.05);
    m.clock += dt;
    m.idle += dt;
    const reduce = s.reducedMotion;

    if (m.intro < 1) m.intro = reduce ? 1 : Math.min(1, m.intro + dt / INTRO_SECONDS);
    const eased = 1 - Math.pow(1 - m.intro, 3);

    if (m.reset) {
      m.yaw += (m.reset.yaw - m.yaw) * (1 - Math.exp(-dt * 7));
      m.pitch += (m.reset.pitch - m.pitch) * (1 - Math.exp(-dt * 7));
      if (Math.abs(m.reset.yaw - m.yaw) < 0.001 && Math.abs(m.reset.pitch - m.pitch) < 0.001) m.reset = null;
    } else if (!m.dragging) {
      const decay = Math.exp(-dt * 4.5);
      m.yaw += m.yawVelocity * dt;
      m.pitch = THREE.MathUtils.clamp(m.pitch + m.pitchVelocity * dt, -PITCH_LIMIT, PITCH_LIMIT);
      m.yawVelocity *= decay;
      m.pitchVelocity *= decay;
      if (s.turntable) m.pitch += (toRadians(s.tilt) - m.pitch) * (1 - Math.exp(-dt * 4));
    }

    const spinning = s.autoRotate && !reduce && !m.dragging && m.idle > s.autoRotateDelay;
    m.spinSpeed += ((spinning ? s.autoRotateSpeed : 0) - m.spinSpeed) * (1 - Math.exp(-dt * 2));
    m.yaw += m.spinSpeed * dt;

    m.zoom += (m.zoomGoal - m.zoom) * (1 - Math.exp(-dt * 8));
    m.tiltX += (m.tiltGoalX - m.tiltX) * (1 - Math.exp(-dt * 6));
    m.tiltY += (m.tiltGoalY - m.tiltY) * (1 - Math.exp(-dt * 6));

    const aspect = size.width / Math.max(size.height, 1);
    const halfView = Math.tan(toRadians(FOV) / 2);
    const fitDistance = bounds.radius / (Math.max(s.fit, 0.05) * halfView * Math.min(1, aspect));
    const distance = fitDistance / m.zoom;
    camera.position.set(0, 0, distance);
    camera.near = distance / 50;
    camera.far = distance * 50;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const halfHeight = fitDistance * halfView;
    place.position.set(s.offsetX * halfHeight * aspect, s.offsetY * halfHeight, 0);

    const intro = s.intro;
    const rise = intro === 'rise' ? (1 - eased) * -0.45 : 0;
    const grow = intro === 'rise' ? 0.9 + 0.1 * eased : 1;
    const twist = intro === 'spin' ? (1 - eased) * -Math.PI * 1.2 : intro === 'rise' ? (1 - eased) * -0.5 : 0;
    const bob = reduce ? 0 : Math.sin(m.clock * 1.3) * s.float * 0.06;
    floatGroup.position.y = rise + bob;
    floatGroup.scale.setScalar(grow);
    tiltGroup.rotation.set(m.tiltX, m.tiltY, 0);
    // Apply yaw first, then pitch around the screen's horizontal axis. Keeping
    // pitch in screen space makes vertical dragging consistent at every yaw.
    spinGroup.rotation.set(m.pitch, m.yaw + twist, 0, 'XYZ');

    const settling =
      m.intro < 1 ||
      m.dragging ||
      !!m.reset ||
      Math.abs(m.yawVelocity) + Math.abs(m.pitchVelocity) > 0.0005 ||
      Math.abs(m.zoomGoal - m.zoom) > 0.0005 ||
      Math.abs(m.tiltGoalX - m.tiltX) + Math.abs(m.tiltGoalY - m.tiltY) > 0.0005 ||
      m.spinSpeed > 0.0005 ||
      (s.autoRotate && !reduce) ||
      (s.float > 0 && !reduce);
    if (settling && visibleRef.current) invalidate();
  });

  return (
    <group ref={placeRef}>
      <group ref={floatRef}>
        <group ref={tiltRef}>
          <group ref={spinRef}>
            <group
              ref={fitRef}
              scale={bounds.scale}
              position={[
                -bounds.center.x * bounds.scale,
                -bounds.center.y * bounds.scale,
                -bounds.center.z * bounds.scale
              ]}
            >
              <primitive object={object} visible={compiled} />
            </group>
          </group>
        </group>
      </group>
      {settingsRef.current.shadow && (
        <ContactShadows
          position={[0, -bounds.floor - 0.08, 0]}
          opacity={settingsRef.current.shadowOpacity}
          scale={bounds.radius * 4}
          blur={2.6}
          far={bounds.floor * 2 + 0.5}
          resolution={512}
          color="#000000"
        />
      )}
    </group>
  );
};

const ModelViewer = ({
  url,
  width = 400,
  height = 400,
  environment = 'studio',
  environmentIntensity = 1,
  environmentFiles,
  modelRotation = [0, 0, 0],
  exposure = 1,
  autoRotate = true,
  autoRotateSpeed = 0.4,
  autoRotateDelay = 2,
  dragRotate = true,
  turntable = false,
  zoom = true,
  minZoom = 0.7,
  maxZoom = 2,
  hoverTilt = 0.15,
  float = 0.3,
  shadow = true,
  shadowOpacity = 0.45,
  intro = 'rise',
  startAngle = -30,
  tilt = 10,
  offsetX = 0,
  offsetY = 0,
  fit = 0.8,
  resetOnDoubleClick = true,
  className = '',
  style,
  onModelLoaded,
  ref
}: ModelViewerProps) => {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [ready, setReady] = useState(false);
  const settings: Settings = {
    autoRotate,
    autoRotateSpeed,
    autoRotateDelay: Math.max(0, autoRotateDelay),
    dragRotate,
    turntable,
    zoom,
    minZoom: Math.min(minZoom, maxZoom),
    maxZoom: Math.max(minZoom, maxZoom),
    hoverTilt: Math.max(0, hoverTilt),
    float: Math.max(0, float),
    shadow,
    shadowOpacity,
    intro,
    startAngle,
    tilt,
    offsetX,
    offsetY,
    fit,
    resetOnDoubleClick,
    reducedMotion: typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useImperativeHandle(
    ref,
    () => ({
      reset: () => resetRef.current?.(),
      capture: (type = 'image/png') => glRef.current?.domElement.toDataURL(type) ?? null
    }),
    []
  );

  useEffect(() => {
    setReady(false);
  }, [url]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const observer = new IntersectionObserver(entries => {
      visibleRef.current = entries.some(entry => entry.isIntersecting);
      if (visibleRef.current) invalidateRef.current?.();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
    onModelLoaded?.();
  }, [onModelLoaded]);

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()} style={{ width, height, ...style }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: FOV, position: [0, 0, 6], near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={state => {
          state.gl.domElement.tabIndex = 0;
          state.gl.domElement.setAttribute('role', 'img');
          state.gl.domElement.setAttribute('aria-label', 'Interactive 2026 robot model. Use arrow keys to rotate, plus and minus to zoom, and Home to reset.');
          glRef.current = state.gl;
          invalidateRef.current = state.invalidate;
        }}
        style={{
          touchAction: 'pan-y',
          cursor: dragRotate ? 'grab' : 'default',
          opacity: ready || intro === 'none' ? 1 : 0,
          transition: intro === 'none' ? 'none' : 'opacity 0.6s ease'
        }}
      >
        <Exposure value={exposure} />
        <directionalLight position={[3, 5, 4]} intensity={0.6} />
        <Lighting environment={environment} intensity={environmentIntensity} files={environmentFiles} />
        <Suspense fallback={null}>
          {url && (
            <Model url={url}>
              {object => {
                object.rotation.set(...modelRotation);
                object.updateMatrixWorld(true);
                return <Stage object={object} settingsRef={settingsRef} visibleRef={visibleRef} resetRef={resetRef} lit={!!environmentFiles || environment !== 'none'} onReady={handleReady} />;
              }}
            </Model>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
