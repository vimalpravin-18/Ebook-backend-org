// server/util/auth.js
export function requireAuth(req, res, next) {
  // Replace with your real session/JWT auth.
  if (!req.user || !req.user.id) return res.status(401).send('Unauthorized')
  next()
}
