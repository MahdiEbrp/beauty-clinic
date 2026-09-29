/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS config required by Liara's buildpack, see below */
// CommonJS config on purpose. Liara's buildpack injects `output: 'standalone'`
// by rewriting a `next.config.js`/`next.config.mjs` file (it does not handle
// `next.config.ts`, and will create a shadowing `next.config.js` that drops the
// next-intl plugin). Keeping the config here means Liara edits this file in
// place instead of replacing it, so `withNextIntl` — and therefore the
// `next-intl/config` alias — stays intact.
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  poweredByHeader: false,
  // Liara's buildpack wants standalone output; set it so its injection is a
  // no-op and the plugin wrapper above is preserved.
  output: "standalone",
  // Keep the postgres driver out of the server bundle so Node built-ins like
  // `net`/`tls` resolve at runtime (instrumentation + API routes import it via
  // the db pool; bundling fails dev compilation with "Can't resolve 'net'").
  serverExternalPackages: ["postgres"],
  // Belt-and-braces for Turbopack: declare the next-intl config alias here too
  // so it does not depend on the plugin's Turbopack injection.
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              // Keyless Google Maps embed (coordinate-based map thumbnail on the landing page).
              "frame-src 'self' https://maps.google.com https://www.google.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
