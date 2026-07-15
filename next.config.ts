import type { NextConfig } from "next";
import { URL } from "url";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "images.chesscomfiles.com",
    }
    ]
  }
};

export default nextConfig;
