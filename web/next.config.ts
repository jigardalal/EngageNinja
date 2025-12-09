import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Use middleware.ts for request-level routing
   * Note: This uses the legacy middleware convention which is deprecated in Next.js 16+
   * Future migration path: Use instrumentation.ts or route handlers for proxy functionality
   * Current approach remains functional but shows deprecation warning
   * See: https://nextjs.org/docs/messages/middleware-to-proxy
   */
};

export default nextConfig;
