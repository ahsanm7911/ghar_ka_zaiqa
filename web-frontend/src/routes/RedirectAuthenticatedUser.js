import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../auth";

export default function RedirectAuthenticatedUser({ children }) {
  if (isAuthenticated()) {
    const user = getUser();
    if (user.user_type === "customer") {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (user.user_type === "chef") {
      return <Navigate to="/chef-dashboard" replace />;
    }
  }
  return children;
}
