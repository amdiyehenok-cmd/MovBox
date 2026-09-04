import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Movbox",
    description: "Stream the latest movies and TV shows in 4K Ultra HD.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080606",
    theme_color: "#080606",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
