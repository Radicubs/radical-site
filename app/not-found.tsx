import Link from "next/link";
import { NotFoundScene } from "@/components/NotFoundScene";

export default function NotFound() {
  return (
    <div className="notfound">
      <NotFoundScene />
      <div className="notfound-vignette" />
      <div className="notfound-content">
        <p className="notfound-kicker">FRC Team 7503 · Frisco, TX</p>
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Wrong turn off the track.</h1>
        <p className="notfound-copy">This page spun out somewhere between here and the pit wall. Let&apos;s get you back on the racing line.</p>
        <p className="notfound-hint">Hold the click to hit hyperspeed.</p>
        <div className="notfound-actions">
          <Link className="btn btn-dark" href="/">Back to home →</Link>
          <Link className="btn btn-light" href="/robot">See the robot</Link>
        </div>
      </div>
    </div>
  );
}
