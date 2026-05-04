import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { hasMinPlan } from "../lib/requirePlan";

export default function PlanRoute({ children, required = "PRO" }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const plan = profile?.plan || "FREE";

  if (!hasMinPlan(plan, required)) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
}
