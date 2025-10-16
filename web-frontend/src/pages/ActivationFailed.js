import { useNavigate } from "react-router-dom";

export default function ActivationFailed() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h2 className="text-danger fw-bold">Activation Failed</h2>
      <p className="text-muted">
        The activation link may be invalid or expired. Please try signing up again.
      </p>
      <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
        Back to Signup
      </button>
    </div>
  );
}
