// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATE · Geo lookup
// GET /api/geo  →  { country: "JP" }
//
// Vercel resolves the visitor's country at the edge and passes it through as
// `x-vercel-ip-country` (ISO 3166-1 alpha-2). No third-party service, no key,
// and no IP address is stored or logged here.
//
// Used to show the 1DERZ fan-club link only in territories where it applies.
// If this returns nothing — local dev, or a host that isn't Vercel — the page
// falls back to a timezone guess on the client.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = (req, res) => {
  const country =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||          // if Cloudflare ever sits in front
    '';

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ country: String(country).toUpperCase() });
};
