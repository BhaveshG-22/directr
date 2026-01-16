import PhotoshootPipeline from "../components/PhotoshootPipeline";
import { Scene } from "../types";
import { prisma } from "@/lib/prisma";

export default async function StudioPage() {
  const styles = await prisma.photoshootStyle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const scenes: Scene[] = styles.map((style) => ({
    uuid: style.id,
    title: style.displayName,
    slug: style.name,
    detailedPrompt: style.basePrompt,
    environment: style.environment,
    lighting: style.lighting,
    mood: style.mood,
    negativePrompt: style.negativePrompt,
    poseTemplates: Array.isArray(style.poseTemplates) ? style.poseTemplates as string[] : [],
  }));

  return <PhotoshootPipeline scenes={scenes} />;
}
