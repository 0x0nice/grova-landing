import type { NextConfig } from "next";

const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_FORMSPREE_ID",
];
const missingPublicEnv = requiredPublicEnv.filter((key) => !process.env[key]?.trim());
if (missingPublicEnv.length > 0) {
  throw new Error(`Missing required public configuration: ${missingPublicEnv.join(", ")}`);
}

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
