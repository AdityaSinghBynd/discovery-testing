export default function handler(req, res) {
  const version = process.env.NEXT_PUBLIC_CACHE_VERSION || "v0.0.0";
  res.status(200).json({ version });
}
