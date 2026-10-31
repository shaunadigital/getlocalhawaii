import type { NextConfig } from "next";

// A Vercel build without the Supabase address and key would ship a directory
// with no listings. Stop that build instead, so the last good deploy stays up.
if (
  process.env.VERCEL &&
  !process.env.GL_SNAPSHOT &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in the Vercel project to build the directory.",
  );
}

const nextConfig: NextConfig = {};

export default nextConfig;
