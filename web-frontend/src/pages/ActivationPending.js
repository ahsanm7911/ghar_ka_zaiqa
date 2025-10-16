export default function ActivationPending() {
  return (
    <div className="container text-center mt-5">
      <h2 className="fw-bold text-primary mb-3">Activate Your Account</h2>
      <p className="text-muted">
        We’ve sent an activation link to your Google email address. <br />
        Please check your inbox and click the link to verify your account.
      </p>
      <div className="mt-4">
        <img
          src="/images/email_sent.svg"
          alt="Email sent illustration"
          style={{ width: "200px" }}
        />
      </div>
    </div>
  );
}
