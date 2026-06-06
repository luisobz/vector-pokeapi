import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**"
      }
    ]
  },
  transpilePackages: ["@vector-pokeapi/ui", "@vector-pokeapi/elements-effects"]
};

export default nextConfig;
