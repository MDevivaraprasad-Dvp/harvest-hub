import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage (farmer-uploaded photos) + Openverse-served thumbnails.
    // Openverse routes through many upstream hosts, so we allow any https origin
    // for thumbnails. If tightening later, add explicit patterns.
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
