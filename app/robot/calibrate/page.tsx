import type { Metadata } from "next";
import { RobotCalibrationStudio } from "@/components/robot/robot-calibration-studio";
import "./calibrate.css";

export const metadata: Metadata = {
  title: "Robot alignment bench | Radicubs 7503",
  description: "Calibrate the robot CAD model against the competition-field plate.",
};

export const dynamic = "force-dynamic";

export default function RobotCalibrationPage() {
  return <RobotCalibrationStudio backgroundUrl="/api/robot-assets/background" modelUrl="/api/robot-assets/model" />;
}
