import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../auth";

export default function PrivateRoute({ children, requiredRole }) {
  const auth = isAuthenticated();
  const user = getUser();

  if (!auth || !user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.user_type !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
