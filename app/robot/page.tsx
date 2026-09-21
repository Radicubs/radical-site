import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { RobotFilmIntro } from "@/components/robot/robot-film-intro";
import { getSiteSettings } from "@/lib/cms";
import { getRobotFilmVideo } from "@/lib/robot-cms";
import "./scrollcraft.css";
import "./film.css";

export const metadata: Metadata = {
  title: "Our Robot | Radicubs FRC 7503",
  description:
    "Scroll to explore the 7503 robot as its intake, hopper, shooter, swerve drivetrain, and electronics separate into a controlled exploded assembly.",
};

export default async function RobotPage() {
  const [settings, videoSrc] = await Promise.all([getSiteSettings(), getRobotFilmVideo()]);
  return (
    <main>
      <Navbar settings={settings} />
      <RobotFilmIntro videoSrc={videoSrc} />
    </main>
  );
}
