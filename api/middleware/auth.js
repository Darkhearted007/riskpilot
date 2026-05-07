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
        console.warn("[Auth Middleware] Missing authorization header");
        return res.status(401).json({
          error: "NO_AUTH_HEADER",
        });
      }

      const token = authHeader.replace("Bearer ", "");

      if (!token) {
        console.warn("[Auth Middleware] Empty token after parsing");
        return res.status(401).json({
          error: "INVALID_TOKEN_FORMAT",
        });
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.warn("[Auth Middleware] Token verification failed:", error?.message);
        return res.status(401).json({
          error: "INVALID_TOKEN",
          details: error?.message || "User verification failed",
        });
      }

      // attach real user
      req.user = user;

      return handler(req, res);
    } catch (err) {
      console.error("[Auth Middleware] Error:", err.message);
      return res.status(500).json({
        error: "AUTH_MIDDLEWARE_FAILED",
        details: err.message,
      });
    }
  };
}
