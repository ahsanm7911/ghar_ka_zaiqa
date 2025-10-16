import LoginForm from "../components/LoginForm";
import "../LoginPage.css";

export default function Login() {
  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="overlay"></div>
      <div className="login-container">
        <LoginForm />
      </div>
    </div>
  );
}
