import PhotoshootPipeline from "./components/PhotoshootPipeline";
import { Scene } from "./types";
import { promises as fs } from "fs";
import path from "path";

export default async function Home() {
  // Read scenes from scenes.json
  const scenesPath = path.join(process.cwd(), "scenes.json");
  const scenesData = await fs.readFile(scenesPath, "utf-8");
  const scenes: Scene[] = JSON.parse(scenesData);

  return <PhotoshootPipeline scenes={scenes} />;
}
