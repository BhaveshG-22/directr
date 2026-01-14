import PhotoshootPipeline from "./components/PhotoshootPipeline";
import { Scene } from "./types";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const styles = await prisma.photoshootStyle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const scenes: Scene[] = styles.map((style) => ({
    uuid: style.id,
    title: style.displayName,
    slug: style.name,
    detailedPrompt: style.basePrompt,
  }));

  return <PhotoshootPipeline scenes={scenes} />;
}
