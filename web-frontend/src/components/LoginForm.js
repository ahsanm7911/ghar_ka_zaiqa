import { useState } from "react";
import { EnvelopeFill, LockFill } from "react-bootstrap-icons";
import SignupForm from "./SignupForm";
import ChefSignup from "./ChefSignup";
import CustomerSignup from "./CustomerSignup";
import api from "../api";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [view, setView] = useState("login"); 
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login/", formData);
      const { token, user } = response.data;
      login(token, user)

      if (user.user_type === "customer") {
        navigate("/customer-dashboard");
      } else if (user.user_type === "chef") {
        navigate("/chef-dashboard");
      }
    } catch (err) {
      setError(err.response?.data || { detail: "Login failed" });
    }
  };

  if (view === "chef") {
    return <ChefSignup goBack={() => setView("login")} />;
  }

  if (view === "customer") {
    return <CustomerSignup goBack={() => setView("login")} />;
  }

  return (
    <div className="card shadow rounded-4 p-4">
      <div className="card-body">
        <h2 className="text-center fw-bold mb-4">Login to Your Dashboard</h2>

        {error && (
          <div className="alert alert-danger">
            {error['non_field_errors']}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white">
              <EnvelopeFill />
            </span>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4 input-group">
            <span className="input-group-text bg-white">
              <LockFill />
            </span>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary w-100 mb-4" type="submit">
            SIGN IN
          </button>
        </form>

        <div className="d-flex align-items-center mb-4">
          <hr className="flex-grow-1" />
          <span className="px-2 text-muted">Or register as</span>
          <hr className="flex-grow-1" />
        </div>

        <SignupForm 
          onChefSignup={() => setView("chef")} 
          onCustomerSignup={() => setView("customer")} 
        />
      </div>
    </div>
  );
}
