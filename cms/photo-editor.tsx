"use client";

import { Button, useDocumentDrawerContext, useDocumentInfo, useField, useForm, useModal } from "@payloadcms/ui";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

// Crop, rotate, flip, straighten and colour-adjust a photo inside the editor. The result
// goes into the upload's own file field, so pressing Save replaces the photo the same way
// choosing a new file would (resized copies are rebuilt and the URL changes).

type Rect = { x: number; y: number; w: number; h: number };
type Adjust = { brightness: number; contrast: number; saturation: number };
type Handle = "move" | "nw" | "ne" | "sw" | "se";

const EDITABLE = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
// Matches the upload's resizeOptions, so converting here never makes a photo bigger than the server would keep.
const MAX_SIDE = 2560;

// iPhones save HEIC, which neither Chrome nor the server's image library can read.
const isHeic = (file: { type: string; name: string }) => /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

// Edits and conversions are handed over as high-quality JPEG (PNG keeps transparency);
// the server then stores every image as WebP, so the photo is only squeezed once.
const handoffType = (sourceType: string) => (sourceType === "image/png" ? "image/png" : "image/jpeg");
const renamed = (name: string, type: string) => `${name.replace(/\.[^.]+$/, "") || "photo"}${type === "image/png" ? ".png" : ".jpg"}`;

async function decodeHeic(blob: Blob) {
  const { heicTo } = await import("heic-to/next");
  return heicTo({ blob, type: "bitmap" });
}

// Files this field produced, so they're never converted a second time.
const converted = new WeakSet<File>();

// HEIC picked in the browser becomes a JPEG before it uploads, at most MAX_SIDE wide.
async function heicToJpeg(file: File): Promise<File> {
  const bitmap = await decodeHeic(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("Couldn't convert this photo.");
  const result = new File([blob], renamed(file.name, "image/jpeg"), { type: "image/jpeg", lastModified: Date.now() });
  converted.add(result);
  return result;
}

const NEUTRAL: Adjust = { brightness: 100, contrast: 100, saturation: 100 };
const ASPECTS: { label: string; value: number | "original" | null }[] = [
  { label: "Free", value: null },
  { label: "Original", value: "original" },
  { label: "Square", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 }
];

type Geometry = { quarter: number; angle: number; flipX: boolean; flipY: boolean };

// Size of the rotated image ("stage") and the largest upright rectangle inside it that
// has no empty corners. Crops are kept inside that rectangle.
function stageOf(image: HTMLImageElement, { quarter, angle }: Geometry) {
  const [w, h] = quarter % 2 ? [image.naturalHeight, image.naturalWidth] : [image.naturalWidth, image.naturalHeight];
  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const width = w * cos + h * sin;
  const height = w * sin + h * cos;
  const k = Math.min(w / (w * cos + h * sin), h / (w * sin + h * cos));
  const safe = { w: w * k, h: h * k, x: (width - w * k) / 2, y: (height - h * k) / 2 };
  return { width, height, safe, ratio: w / h };
}

function fitCrop(safe: Rect, aspect: number | null): Rect {
  if (!aspect) return safe;
  const [w, h] = safe.w / safe.h > aspect ? [safe.h * aspect, safe.h] : [safe.w, safe.w / aspect];
  return { x: safe.x + (safe.w - w) / 2, y: safe.y + (safe.h - h) / 2, w, h };
}

function drawStage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, geometry: Geometry, stage: { width: number; height: number }) {
  ctx.translate(stage.width / 2, stage.height / 2);
  ctx.rotate((geometry.angle * Math.PI) / 180 + (geometry.quarter * Math.PI) / 2);
  ctx.scale(geometry.flipX ? -1 : 1, geometry.flipY ? -1 : 1);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
}

const cssFilter = ({ brightness, contrast, saturation }: Adjust) => `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

// Safari before 18 ignores ctx.filter, so do the same maths by hand there.
function applyAdjustPixels(ctx: CanvasRenderingContext2D, width: number, height: number, adjust: Adjust) {
  const pixels = ctx.getImageData(0, 0, width, height);
  const data = pixels.data;
  const b = adjust.brightness / 100;
  const c = adjust.contrast / 100;
  const s = adjust.saturation / 100;
  const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
  for (let i = 0; i < data.length; i += 4) {
    const r = clamp((clamp(data[i] * b) - 127.5) * c + 127.5);
    const g = clamp((clamp(data[i + 1] * b) - 127.5) * c + 127.5);
    const bl = clamp((clamp(data[i + 2] * b) - 127.5) * c + 127.5);
    data[i] = (0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * bl;
    data[i + 1] = (0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * bl;
    data[i + 2] = (0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * bl;
  }
  ctx.putImageData(pixels, 0, 0);
}

async function exportPhoto(image: HTMLImageElement, geometry: Geometry, crop: Rect, adjust: Adjust, name: string, mimeType: string) {
  const stage = stageOf(image, geometry);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.w));
  canvas.height = Math.max(1, Math.round(crop.h));
  const ctx = canvas.getContext("2d")!;
  const adjusted = adjust.brightness !== 100 || adjust.contrast !== 100 || adjust.saturation !== 100;
  ctx.filter = cssFilter(adjust);
  const nativeFilter = ctx.filter === cssFilter(adjust);
  if (!nativeFilter) ctx.filter = "none";
  ctx.imageSmoothingQuality = "high";
  ctx.translate(-crop.x, -crop.y);
  drawStage(ctx, image, geometry, stage);
  if (adjusted && !nativeFilter) applyAdjustPixels(ctx, canvas.width, canvas.height, adjust);

  const type = handoffType(mimeType);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error("Couldn't save the edited photo.");
  const file = new File([blob], renamed(name, type), { type, lastModified: Date.now() });
  converted.add(file);
  return file;
}

function EditorModal({ src, name, mimeType, onCancel, onApply }: {
  src: string;
  name: string;
  mimeType: string;
  onCancel: () => void;
  onApply: (file: File) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState<Geometry>({ quarter: 0, angle: 0, flipX: false, flipY: false });
  const [aspectChoice, setAspectChoice] = useState<number | "original" | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [adjust, setAdjust] = useState<Adjust>(NEUTRAL);
  const [busy, setBusy] = useState(false);
  const [area, setArea] = useState({ width: 800, height: 520 });
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ handle: Handle; x: number; y: number; start: Rect } | null>(null);

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    const failed = () => !cancelled && setError("This photo couldn't be loaded for editing.");
    (async () => {
      let url = src;
      // A HEIC already in the library is decoded here, since browsers other than Safari can't show it.
      if (isHeic({ type: mimeType, name })) {
        const bitmap = await decodeHeic(await (await fetch(src)).blob());
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("decode");
        url = objectUrl = URL.createObjectURL(blob);
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => !cancelled && setImage(img);
      img.onerror = failed;
      img.src = url;
    })().catch(failed);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, mimeType, name]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setArea({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stage = useMemo(() => (image ? stageOf(image, geometry) : null), [image, geometry]);
  const aspect = aspectChoice === "original" ? stage?.ratio ?? null : aspectChoice;
  const scale = stage ? Math.min(area.width / stage.width, area.height / stage.height) : 1;

  // Turning or straightening changes the usable area, so start the crop over.
  useEffect(() => {
    if (stage) setCrop(fitCrop(stage.safe, aspect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, geometry.quarter, geometry.angle, aspect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !stage) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(stage.width * scale * dpr);
    canvas.height = Math.round(stage.height * scale * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.clearRect(0, 0, stage.width, stage.height);
    drawStage(ctx, image, geometry, stage);
  }, [image, geometry, stage, scale]);

  const startDrag = (handle: Handle) => (event: ReactPointerEvent<HTMLElement>) => {
    if (!crop) return;
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = { handle, x: event.clientX, y: event.clientY, start: crop };
  };

  const onDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const active = drag.current;
    if (!active || !stage) return;
    const { safe } = stage;
    const dx = (event.clientX - active.x) / scale;
    const dy = (event.clientY - active.y) / scale;
    const start = active.start;
    if (active.handle === "move") {
      setCrop({
        ...start,
        x: Math.min(Math.max(start.x + dx, safe.x), safe.x + safe.w - start.w),
        y: Math.min(Math.max(start.y + dy, safe.y), safe.y + safe.h - start.h)
      });
      return;
    }
    const sx = active.handle.includes("e") ? 1 : -1;
    const sy = active.handle.includes("s") ? 1 : -1;
    const ax = sx > 0 ? start.x : start.x + start.w;
    const ay = sy > 0 ? start.y : start.y + start.h;
    const min = 24 / scale;
    let w = Math.max(min, (sx > 0 ? start.x + start.w + dx : start.x + dx) * sx - ax * sx);
    let h = Math.max(min, (sy > 0 ? start.y + start.h + dy : start.y + dy) * sy - ay * sy);
    const maxW = sx > 0 ? safe.x + safe.w - ax : ax - safe.x;
    const maxH = sy > 0 ? safe.y + safe.h - ay : ay - safe.y;
    if (aspect) {
      if (w / h > aspect) h = w / aspect;
      else w = h * aspect;
      if (w > maxW) [w, h] = [maxW, maxW / aspect];
      if (h > maxH) [w, h] = [maxH * aspect, maxH];
    } else {
      w = Math.min(w, maxW);
      h = Math.min(h, maxH);
    }
    setCrop({ x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h });
  }, [stage, scale, aspect]);

  const endDrag = () => { drag.current = null; };

  const turn = (by: 1 | -1) => setGeometry((g) => ({ ...g, quarter: (g.quarter + by + 4) % 4 }));
  // Flips follow what's on screen: after a quarter turn, "horizontal" is the photo's vertical axis.
  const flip = (axis: "h" | "v") => setGeometry((g) => ((axis === "h") === (g.quarter % 2 === 0) ? { ...g, flipX: !g.flipX } : { ...g, flipY: !g.flipY }));
  const reset = () => {
    setGeometry({ quarter: 0, angle: 0, flipX: false, flipY: false });
    setAspectChoice(null);
    setAdjust(NEUTRAL);
    if (image) setCrop(fitCrop(stageOf(image, { quarter: 0, angle: 0, flipX: false, flipY: false }).safe, null));
  };

  const apply = async () => {
    if (!image || !crop) return;
    setBusy(true);
    try {
      onApply(await exportPhoto(image, geometry, crop, adjust, name, mimeType));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the edited photo.");
      setBusy(false);
    }
  };

  const slider = (label: string, key: keyof Adjust) => <label className="photo-editor__slider">
    <span>{label}<output>{adjust[key] - 100 > 0 ? "+" : ""}{adjust[key] - 100}</output></span>
    <input type="range" min={0} max={200} value={adjust[key]} onChange={(e) => setAdjust((a) => ({ ...a, [key]: Number(e.target.value) }))} onDoubleClick={() => setAdjust((a) => ({ ...a, [key]: 100 }))} />
  </label>;

  return <div className="photo-editor" role="dialog" aria-modal="true" aria-label="Edit photo">
    <header className="photo-editor__bar">
      <strong>Edit photo</strong>
      <span className="photo-editor__size">{crop ? `${Math.round(crop.w)} × ${Math.round(crop.h)} px` : ""}</span>
      <div className="photo-editor__actions">
        <Button buttonStyle="secondary" size="small" margin={false} onClick={onCancel}>Cancel</Button>
        <Button size="small" margin={false} onClick={apply} disabled={!image || busy}>{busy ? "Saving…" : "Done"}</Button>
      </div>
    </header>

    <div className="photo-editor__body">
      <div className="photo-editor__stage" ref={areaRef}>
        {error && <p className="photo-editor__error">{error}</p>}
        {!image && !error && <p className="photo-editor__loading">Loading photo…</p>}
        {stage && <div className="photo-editor__canvas" style={{ width: stage.width * scale, height: stage.height * scale }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", filter: cssFilter(adjust) }} />
          {crop && <div
            className="photo-editor__crop"
            style={{ left: crop.x * scale, top: crop.y * scale, width: crop.w * scale, height: crop.h * scale }}
            onPointerDown={startDrag("move")}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {(["nw", "ne", "sw", "se"] as const).map((handle) => <span
              key={handle}
              className={`photo-editor__handle photo-editor__handle--${handle}`}
              onPointerDown={startDrag(handle)}
              onPointerMove={onDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />)}
          </div>}
        </div>}
      </div>

      <aside className="photo-editor__panel">
        <section>
          <h4>Crop</h4>
          <div className="photo-editor__chips">
            {ASPECTS.map((option) => <button
              key={option.label}
              type="button"
              className={aspectChoice === option.value ? "is-active" : undefined}
              onClick={() => setAspectChoice(option.value)}
            >{option.label}</button>)}
          </div>
        </section>
        <section>
          <h4>Rotate &amp; flip</h4>
          <div className="photo-editor__chips">
            <button type="button" onClick={() => turn(-1)}>↺ Left</button>
            <button type="button" onClick={() => turn(1)}>↻ Right</button>
            <button type="button" onClick={() => flip("h")}>⇋ Flip</button>
            <button type="button" onClick={() => flip("v")}>⇵ Flip</button>
          </div>
          <label className="photo-editor__slider">
            <span>Straighten<output>{geometry.angle > 0 ? "+" : ""}{geometry.angle}°</output></span>
            <input type="range" min={-45} max={45} step={0.5} value={geometry.angle} onChange={(e) => setGeometry((g) => ({ ...g, angle: Number(e.target.value) }))} onDoubleClick={() => setGeometry((g) => ({ ...g, angle: 0 }))} />
          </label>
        </section>
        <section>
          <h4>Adjust</h4>
          {slider("Brightness", "brightness")}
          {slider("Contrast", "contrast")}
          {slider("Saturation", "saturation")}
        </section>
        <button type="button" className="photo-editor__reset" onClick={reset}>Reset all</button>
        <p className="photo-editor__hint">Drag the box to move the crop, or its corners to resize. Double-click a slider to reset it.</p>
      </aside>
    </div>
  </div>;
}

// "Edit photo" on a photo card elsewhere in the editor opens that photo's drawer through
// its own pencil button, and leaves this note so the drawer goes straight to the editor.
let quickEditRequestedAt = 0;
const takeQuickEdit = () => {
  const requested = Date.now() - quickEditRequestedAt < 15000;
  quickEditRequestedAt = 0;
  return requested;
};

// Sits under the upload on every photo's edit screen.
export function PhotoEditorField() {
  const { data } = useDocumentInfo();
  const { setModified, submit } = useForm();
  const { drawerSlug } = useDocumentDrawerContext();
  const { closeModal } = useModal();
  const { value, setValue } = useField<File | null>({ path: "file" });
  const [open, setOpen] = useState(false);
  const [edited, setEdited] = useState<{ file: File; previous: File | null; preview: string } | null>(null);
  // Set when the editor was opened from a photo card: Done then saves and closes the drawer.
  const [quick, setQuick] = useState(false);
  const [saveQueued, setSaveQueued] = useState(false);

  // A file picked after editing replaces the edit.
  useEffect(() => {
    if (edited && value !== edited.file) setEdited(null);
  }, [value, edited]);

  const doc = data as { url?: string; filename?: string; mimeType?: string; updatedAt?: string } | undefined;
  const pending = value instanceof File && value !== edited?.file ? value : null;
  // Always edit from the photo as it was, so repeated edits don't stack up JPEG losses.
  const baseFile = edited ? edited.previous : pending;
  const baseUrl = useMemo(() => (baseFile ? URL.createObjectURL(baseFile) : null), [baseFile]);
  useEffect(() => () => { if (baseUrl) URL.revokeObjectURL(baseUrl); }, [baseUrl]);

  const src = baseUrl ?? (doc?.url ? `${doc.url}${doc.url.includes("?") ? "&" : "?"}v=${encodeURIComponent(doc.updatedAt ?? "")}` : null);
  const mimeType = baseFile?.type || doc?.mimeType || "";
  const name = baseFile?.name || doc?.filename || "photo.jpg";
  const editable = Boolean(src) && EDITABLE.includes(mimeType);

  // Convert a newly picked iPhone photo before it uploads (see heicToJpeg).
  const [conversion, setConversion] = useState<"working" | "done" | "failed" | null>(null);
  useEffect(() => {
    if (!pending || converted.has(pending) || !isHeic(pending)) return;
    let cancelled = false;
    const source = pending;
    setConversion("working");
    heicToJpeg(source).then((file) => {
      if (cancelled) return;
      setValue(file);
      setConversion("done");
    }).catch(() => {
      if (cancelled) return;
      converted.add(source);
      setConversion("failed");
    });
    return () => { cancelled = true; };
  }, [pending, setValue]);

  useEffect(() => {
    if (editable && takeQuickEdit()) {
      setQuick(true);
      setOpen(true);
    }
  }, [editable]);

  // Submit once the edited file is in the form, so the save carries it.
  useEffect(() => {
    if (!saveQueued || !edited || value !== edited.file) return;
    setSaveQueued(false);
    void submit().then((result) => {
      if (result?.res.ok && drawerSlug) closeModal(drawerSlug);
    });
  }, [saveQueued, edited, value, submit, drawerSlug, closeModal]);

  const status = conversion === "working" ? <span className="photo-editor-field__note">Converting iPhone photo…</span>
    : conversion === "done" ? <span className="photo-editor-field__note">Converted from iPhone format. The preview above may still show the original until you save.</span>
    : conversion === "failed" ? <span className="photo-editor-field__error">This iPhone photo couldn&apos;t be converted. Export it as JPEG and upload that instead.</span>
    : null;

  if (!src || !editable || conversion === "working") return status ? <div className="field-type photo-editor-field">{status}</div> : null;

  const onApply = (file: File) => {
    setEdited((current) => {
      if (current) URL.revokeObjectURL(current.preview);
      return { file, previous: current ? current.previous : pending, preview: URL.createObjectURL(file) };
    });
    setValue(file);
    setModified(true);
    setOpen(false);
    if (quick) setSaveQueued(true);
  };

  const undo = () => {
    if (!edited) return;
    URL.revokeObjectURL(edited.preview);
    setValue(edited.previous);
    setEdited(null);
  };

  return <div className="field-type photo-editor-field">
    <div className="photo-editor-field__row">
      <Button buttonStyle="secondary" size="small" margin={false} onClick={() => setOpen(true)}>{edited ? "Keep editing" : "Edit photo"}</Button>
      {edited ? <>
        <img src={edited.preview} alt="" className="photo-editor-field__thumb" />
        <span>Edited. Press <strong>Save</strong> to replace the photo everywhere it&apos;s used.</span>
        <button type="button" className="photo-editor-field__undo" onClick={undo}>Undo</button>
      </> : <span className="photo-editor-field__note">Crop, rotate, straighten or adjust colour.</span>}
    </div>
    {status && !edited && <div className="photo-editor-field__status">{status}</div>}
    {/* Portalled so no transformed ancestor in the form can trap the fixed overlay. */}
    {open && createPortal(<EditorModal src={src} name={name} mimeType={mimeType} onCancel={() => { setOpen(false); setQuick(false); }} onApply={onApply} />, document.body)}
  </div>;
}

// Adds "Edit photo" beside the pencil on every image card in any upload field (team photos,
// album photos, sponsor logos...). Payload doesn't expose a slot inside those cards, so the
// button is added to the rendered card; clicking it opens the card's own drawer, which
// keeps Payload's refresh of the card once the photo is saved.
const CARD = ".upload-relationship-details";

function addQuickEditButtons(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(`${CARD}__actions`).forEach((actions) => {
    const card = actions.closest(CARD);
    const pencil = actions.querySelector<HTMLButtonElement>(`${CARD}__edit`);
    const isImage = Boolean(card?.querySelector(`${CARD}__thumbnail img`));
    const existing = actions.querySelector(".photo-editor-quick");
    if (!pencil || !isImage) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-editor-quick";
    button.textContent = "Edit photo";
    // Keep the press from starting a drag in reorderable photo lists.
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      quickEditRequestedAt = Date.now();
      pencil.click();
    });
    actions.prepend(button);
  });
}

export function PhotoEditorProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    addQuickEditButtons(document);
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => addQuickEditButtons(document));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return <>{children}</>;
}
