import { createClient } from "@supabase/supabase-js";

/**
 * Supabase JWT verifier middleware
 * Attaches real user to req.user
 */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: "NO_AUTH_HEADER",
        });
      }

      const token = authHeader.replace("Bearer ", "");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: "INVALID_TOKEN",
        });
      }

      // attach real user
      req.user = user;

      return handler(req, res);
    } catch (err) {
      return res.status(500).json({
        error: "AUTH_MIDDLEWARE_FAILED",
        details: err.message,
      });
    }
  };
}
