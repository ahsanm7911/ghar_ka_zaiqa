import { useNavigate } from "react-router-dom";

export default function ActivationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h2 className="text-success fw-bold">Your Account is Activated!</h2>
      <p className="text-muted">You can now log in to your account.</p>
      <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
        Go to Login
      </button>
    </div>
  );
}
