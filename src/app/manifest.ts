import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SDG Buddy",
    short_name: "SDG Buddy",
    description:
      "A platform designed to help individuals align their daily actions with the united nation sustainable development goals (UNSDGs).",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      {
        src: "/logo.png",
        sizes: "474x496",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "474x496",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}