"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { robotSystems } from "@/data/robot";
import { labelArt } from "./label-art";
import { CmsRobotHero } from "./cms-robot-hero";

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root: Element | string, opts?: Record<string, unknown>) => ScrollCraftApi;
      reduce: boolean;
      instances: ScrollCraftApi[];
    };
  }
}

type ScrollCraftApi = { acts: { el: Element; p: number }[]; layout: () => void };

const ENGINE = "/robot/scrollcraft.js";

/** Load the engine once per document. It has no teardown, so a second mount
 *  would double every global listener; React's development double-effect makes
 *  that the normal case rather than the edge case. */
let enginePromise: Promise<void> | null = null;
function loadEngine() {
  if (window.ScrollCraft) return Promise.resolve();
  if (!enginePromise) {
    enginePromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = ENGINE;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("scrollcraft engine failed to load"));
      document.head.appendChild(s);
    });
  }
  return enginePromise;
}

/** The supplied subsystem title, as strokes the separation can draw.
 *  The accessible name is the real <h2> text beside it; this is its face. */
function DrawnLabel({ id }: { id: keyof typeof labelArt }) {
  const art = labelArt[id];
  return (
    <svg
      className="rb-tag__art"
      viewBox={`0 0 ${art.w} ${art.h}`}
      style={{ ["--n" as string]: art.lines.length }}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
        {art.lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            pathLength={1}
            style={{ ["--i" as string]: i }}
          />
        ))}
      </g>
    </svg>
  );
}

export function RobotExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const teardownRef = useRef<HTMLElement>(null);
  const rebuildRef = useRef<HTMLElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || mounted.current) return;
    mounted.current = true;

    let raf = 0;
    let cancelled = false;

    loadEngine()
      .then(() => {
        if (cancelled || !window.ScrollCraft) return;
        root.dataset.scReady = "true";
        const api = window.ScrollCraft.mount(root);
        const teardown = api.acts.find((a) => a.el === teardownRef.current);
        const rebuild = api.acts.find((a) => a.el === rebuildRef.current);
        if (!teardown) return;

        const tags = Array.from(root.querySelectorAll<HTMLElement>("[data-sys]"));
        const stage = teardownRef.current?.querySelector<HTMLElement>("[data-sc-stage]");
        let last = -1;

        // The signature move. One loop, six style writes a frame, no React
        // state: separation drives the labels, the leaders and the ruler, and
        // the reassembly act runs the same value backwards.
        const tick = () => {
          const sep = rebuild && rebuild.p > 0 ? 1 - rebuild.p : teardown.p;
          if (Math.abs(sep - last) > 0.0006) {
            last = sep;
            root.style.setProperty("--sep", sep.toFixed(4));
            for (const tag of tags) {
              const from = Number(tag.dataset.from);
              const to = Number(tag.dataset.to);
              const d = Math.min(1, Math.max(0, (sep - from) / (to - from)));
              tag.style.setProperty("--d", d.toFixed(4));
            }
            // The harness cannot read a bespoke layer's semantics, so publish
            // the value that actually paints rather than raw scroll progress.
            if (stage) stage.dataset.scVerifyState = `sep:${sep.toFixed(2)}`;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* No engine, no motion: the markup below is already the static page. */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const [intake, hopper, shooter, drivetrain, electronics] = robotSystems;

  return (
    <div className="rb" ref={rootRef}>
      {/* ---------------------------------------------------------------- */}
      {/* The separation ruler. It reports how far apart the machine is; it   */}
      {/* is not a menu, and nothing on this page can be skipped to.          */}
      <aside className="rb-ruler" aria-hidden="true">
        <span className="rb-ruler__cap">Assembled</span>
        <span className="rb-ruler__track">
          <span className="rb-ruler__fill" />
          {robotSystems.map((s) => (
            <span key={s.id} className="rb-ruler__tick" data-sys={s.id} data-from={s.draw[0]} data-to={s.draw[1]}>
              <i />
              <b>{s.name}</b>
            </span>
          ))}
        </span>
        <span className="rb-ruler__cap">Separated</span>
      </aside>

      {/* ================================================== ACT 1 presence = */}
      <section className="rb-act rb-hero" data-sc-act="pin" data-sc-span="2" data-sc-drift="#0a0b0c">
        <div data-sc-stage className="rb-hero__stage">
          <div className="rb-room" />
          <CmsRobotHero />

          <div className="rb-plane rb-plane--fore" data-sc-parallax="0.62" aria-hidden="true" />

          <div className="rb-copy rb-copy--hero" data-sc-cue="0 0.78 0">
            <p className="rb-kicker">FRC 7503 · Radicubs · Frisco, Texas</p>
            <h1 className="rb-display rb-display--xl">Engineered to compete.</h1>
            <p className="rb-lede">
              Five systems, one frame, built and wired by students. This is the machine as it played.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================= ACT 2 the claim ==== */}
      {/* Authored silence. One line, unpinned, immediately before the peak.  */}
      <section className="rb-quiet">
        <div className="rb-wrap" data-sc-in data-sc-stagger="80">
          <p className="rb-display rb-display--md">A robot is only ever seen assembled.</p>
          <p className="rb-lede rb-lede--muted">This one does not have to be.</p>
        </div>
      </section>

      {/* ========================================= ACT 3 the teardown ===== */}
      {/* The peak. The wheel is the teardown's timeline.                     */}
      <section
        ref={teardownRef}
        className="rb-act rb-teardown"
        data-sc-act="scrub"
        data-sc-span="3.6"
        data-sc-dwell="0.34"
        data-sc-drift="#0b0d0e"
      >
        <div data-sc-stage className="rb-stage">
          {/* The whole 16:9 frame is held on stage, never cropped: a separated
              component that leaves the viewport is a component the visitor
              loses track of. */}
          <div className="rb-cinema">
            <img className="sc-stage__poster" src="/robot/poster-assembled.webp" alt="" width={1280} height={720} />
            <img
              className="rb-stage__still"
              src="/robot/poster-exploded.webp"
              alt="The 7503 robot separated into its subsystems: four wheels and swerve modules below, roller and motor assemblies to each side, the shooter frame above, and the control board and wiring harness at the centre."
              width={1280}
              height={720}
              loading="lazy"
            />
            <video
              data-sc-scrub
              data-sc-src="/robot/teardown.mp4"
              data-sc-src-mobile="/robot/teardown-m.mp4"
              playsInline
              muted
            />
            <div className="rb-vignette" />
          </div>

          <svg className="rb-leads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {robotSystems.map((s) => (
              <line
                key={s.id}
                data-sys={s.id}
                data-from={s.draw[0]}
                data-to={s.draw[1]}
                x1={s.zone[0] * 100}
                y1={s.zone[1] * 100}
                x2={s.label[0] * 100 + 4}
                y2={s.label[1] * 100 + 5}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {robotSystems.map((s) => (
            <div
              key={s.id}
              className="rb-tag"
              data-sys={s.id}
              data-from={s.draw[0]}
              data-to={s.draw[1]}
              style={{ left: `${s.label[0] * 100}%`, top: `${s.label[1] * 100}%` }}
            >
              <h2 className="rb-tag__name">
                <span className="rb-sr">{s.name}</span>
                <DrawnLabel id={s.id} />
              </h2>
              <p className="rb-tag__note">{s.note}</p>
            </div>
          ))}

          <div className="rb-scrim rb-scrim--corner" />
          <div className="rb-copy rb-copy--teardown" data-sc-cue="0 0.3 0 0.13">
            <h2 className="rb-display rb-display--lg">It comes apart in your hand.</h2>
            <p className="rb-lede">Five groups. Nothing here is a model of the robot. It is the robot.</p>
          </div>
        </div>
      </section>

      {/* ============================================== ACT 4 intake ===== */}
      <section className="rb-act rb-focus rb-focus--intake" data-sc-act="pin" data-sc-span="1.6" data-sc-drift="#0c0e10">
        <div data-sc-stage className="rb-bench">
          <div className="rb-room" />
          <div className="rb-bench__in">
          <div className="rb-copy rb-copy--focus" data-sc-cue="0.1 1">
            <h2 className="rb-display rb-display--md">{intake.name}</h2>
            <p className="rb-lede">{intake.line}</p>
          </div>
          <figure className="rb-plate rb-plate--wide" data-sc-reveal="left" data-sc-reveal-at="0.04 0.5">
            <img src={intake.plate} alt={intake.plateAlt} width={1240} height={840} loading="lazy" />
          </figure>
          <div className="rb-copy rb-copy--focus" data-sc-cue="0.34 1" style={{ order: 2 }}>
            <p className="rb-body" style={{ marginInline: "auto", marginTop: 0 }}>
              {intake.description}
            </p>
            <p className="rb-note">
              {intake.note}
              <span className="rb-note__caveat">{intake.caveat}</span>
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* ============================================== ACT 5 hopper ===== */}
      {/* The frame holds still while the route is drawn across it.          */}
      <section className="rb-act rb-focus rb-route" data-sc-act="pin" data-sc-span="2" data-sc-drift="#0d0f10">
        <div data-sc-stage className="rb-bench">
          <div className="rb-room" />
          <div className="rb-bench__in">
          <figure className="rb-plate rb-plate--route">
            <img src={hopper.plate} alt={hopper.plateAlt} width={1800} height={1008} loading="lazy" />
            <svg className="rb-route__svg" viewBox="0 0 100 56" aria-hidden="true">
              <path
                className="rb-route__halo"
                d="M 62 23 C 55 29, 45 34, 35 32 C 27 30, 24 24, 30 19 C 36 14, 48 13, 56 16"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="rb-route__path"
                d="M 62 23 C 55 29, 45 34, 35 32 C 27 30, 24 24, 30 19 C 36 14, 48 13, 56 16"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <g className="rb-route__stations">
                <circle cx="62" cy="23" r="0.9" style={{ ["--at" as string]: 0.02 }} />
                <circle cx="30" cy="26" r="0.9" style={{ ["--at" as string]: 0.46 }} />
                <circle cx="56" cy="16" r="0.9" style={{ ["--at" as string]: 0.94 }} />
                <text x="64" y="21" style={{ ["--at" as string]: 0.06 }}>
                  In
                </text>
                <text x="19" y="27" style={{ ["--at" as string]: 0.5 }}>
                  Held
                </text>
                <text x="58" y="13" style={{ ["--at" as string]: 0.96 }}>
                  Out
                </text>
              </g>
            </svg>
          </figure>
          <div className="rb-copy rb-copy--route" data-sc-cue="0.12 1">
            <h2 className="rb-display rb-display--md">{hopper.name}</h2>
            <p className="rb-lede">{hopper.line}</p>
            <p className="rb-body">{hopper.description}</p>
            <p className="rb-note">
              {hopper.note}
              <span className="rb-note__caveat">{hopper.caveat}. The route above is indicative.</span>
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* ============================================= ACT 6 shooter ===== */}
      {/* Everything so far travelled vertically, so sideways reads as speed. */}
      <section className="rb-act rb-shooter" data-sc-act="pan" data-sc-span="1.7" data-sc-drift="#0e1011">
        <div data-sc-stage className="rb-bench">
          <div className="rb-room" />
          <div className="rb-rail" data-sc-pan="0.02">
            <div className="rb-rail__item rb-rail__item--head">
              <h2 className="rb-display rb-display--md">{shooter.name}</h2>
              <p className="rb-lede">{shooter.line}</p>
            </div>
            <figure className="rb-rail__item rb-rail__item--plate">
              <img src={shooter.plate} alt={shooter.plateAlt} width={1680} height={1200} loading="lazy" />
            </figure>
            <div className="rb-rail__item rb-rail__item--note">
              <p className="rb-body">{shooter.description}</p>
              <p className="rb-note">
                {shooter.note}
                <span className="rb-note__caveat">{shooter.caveat}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== ACT 7 drivetrain ===== */}
      {/* The one question on this page a pointer can answer directly.       */}
      <section className="rb-drivetrain" data-sc-spotlight>
        <div className="rb-wrap rb-drivetrain__grid" data-sc-in data-sc-stagger="70">
          <div className="rb-drivetrain__copy">
            <h2 className="rb-display rb-display--md">{drivetrain.name}</h2>
            <p className="rb-lede">{drivetrain.line}</p>
            <p className="rb-body">{drivetrain.description}</p>
            <p className="rb-note">
              {drivetrain.note}
              <span className="rb-note__caveat">{drivetrain.caveat}</span>
            </p>
          </div>
          <figure className="rb-plate rb-plate--drive">
            <img src={drivetrain.plate} alt={drivetrain.plateAlt} width={2120} height={760} loading="lazy" />
            <svg className="rb-azimuth" viewBox="0 0 100 36" aria-hidden="true">
              {[
                [16.2, 24.6],
                [42, 30.6],
                [58, 30.6],
                [81.4, 24],
              ].map(([x, y], i) => (
                <g key={i} className="rb-azimuth__mod" style={{ ["--x" as string]: x, ["--y" as string]: y }}>
                  <circle cx={x} cy={y} r="3.1" vectorEffect="non-scaling-stroke" />
                  <line className="rb-azimuth__needle" x1={x} y1={y} x2={x} y2={y - 5.4} vectorEffect="non-scaling-stroke" />
                </g>
              ))}
            </svg>
            <figcaption className="rb-note rb-note--under">
              Four modules, steered independently. The needles follow your pointer through the range a module
              actually turns.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ========================================= ACT 8 electronics ===== */}
      {/* An iris is literally an opening. Used once on this page, here.     */}
      <section
        className="rb-act rb-focus rb-focus--elec"
        data-sc-act="pin"
        data-sc-span="1.6"
        data-sc-drift="#0c0e0f"
      >
        <div data-sc-stage className="rb-bench">
          <div className="rb-room" />
          <div className="rb-bench__in">
          <figure className="rb-plate rb-plate--iris" data-sc-reveal="iris" data-sc-reveal-at="0.04 0.44">
            <img src={electronics.plate} alt={electronics.plateAlt} width={1440} height={990} loading="lazy" />
          </figure>
          <div className="rb-copy rb-copy--focus rb-copy--trail" data-sc-cue="0.2 1">
            <h2 className="rb-display rb-display--md">{electronics.name}</h2>
            <p className="rb-lede">{electronics.line}</p>
            <p className="rb-body">{electronics.description}</p>
            <p className="rb-note">
              {electronics.note}
              <span className="rb-note__caveat">{electronics.caveat}</span>
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* ========================================== ACT 9 reassembly ===== */}
      {/* The teardown, backwards. The close has to be the same footage or it */}
      {/* is a different machine.                                            */}
      <section
        ref={rebuildRef}
        className="rb-act rb-rebuild"
        data-sc-act="scrub"
        data-sc-span="2.4"
        data-sc-dwell="0.3"
        data-sc-drift="#090a0b"
      >
        <div data-sc-stage className="rb-stage">
          <div className="rb-cinema">
            <img className="sc-stage__poster" src="/robot/poster-exploded.webp" alt="" width={1280} height={720} />
            <img
              className="rb-stage__still"
              src="/robot/poster-assembled.webp"
              alt="The 7503 robot, reassembled and complete, on the competition field."
              width={1280}
              height={720}
              loading="lazy"
            />
            <video
              data-sc-scrub
              data-sc-src="/robot/rebuild.mp4"
              data-sc-src-mobile="/robot/rebuild-m.mp4"
              playsInline
              muted
            />
            <div className="rb-vignette" />
          </div>
          <div className="rb-scrim rb-scrim--band" />
          <div className="rb-copy rb-copy--close" data-sc-cue="0.44 1 0.24 0">
            <h2 className="rb-display rb-display--lg">
              One machine.
              <span>Every system working together.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* ======================================= the specification plate = */}
      <section className="rb-plateout">
        <div className="rb-wrap" data-sc-in data-sc-stagger="60">
          <h2 className="rb-plateout__title">7503 · 2026</h2>
          <dl className="rb-spec">
            {robotSystems.map((s) => (
              <div key={s.id}>
                <dt>{s.name}</dt>
                <dd>{s.note}</dd>
                <dd className="rb-spec__src">
                  <Link href={`/blog/${s.source}`}>{s.sourceLabel}</Link>
                </dd>
              </div>
            ))}
          </dl>
          <p className="rb-plateout__foot">
            Every description on this page comes from the team&apos;s own dated build notes. No performance figures
            are published, because none have been verified. <Link href="/team">Meet the students who built it</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
