import Link from "@/components/ui/intent-link";
import { NotFoundScene } from "@/components/NotFoundScene";

export default function NotFound() {
  return (
    <div className="notfound">
      <NotFoundScene />
      <div className="notfound-vignette" />
      <div className="notfound-content">
        <p className="notfound-kicker">FRC Team 7503 · Frisco, TX</p>
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Looks like we lost this page.</h1>
        <p className="notfound-copy">Even our best builds need a fix now and then. Let's get you back to the team.</p>
        <p className="notfound-hint">Hold the click to hit hyperspeed.</p>
        <div className="notfound-actions">
          <Link className="btn btn-dark" href="/">Back to home →</Link>
          <Link className="btn btn-light" href="/journey">See our journey</Link>
        </div>
      </div>
    </div>
  );
}
