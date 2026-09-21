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
        <h1 className="notfound-title">You&apos;ve overshot the pit.</h1>
        <p className="notfound-copy">This page doesn&apos;t exist — but our robot does. Head back before you hit the wall.</p>
        <div className="notfound-actions">
          <Link className="btn btn-dark" href="/">Back to home →</Link>
          <Link className="btn btn-light" href="/robot">See the robot</Link>
        </div>
      </div>
    </div>
  );
}
