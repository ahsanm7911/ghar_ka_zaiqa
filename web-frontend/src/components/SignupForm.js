export default function SignupForm({ onChefSignup, onCustomerSignup }) {
  return (
    <div className="d-flex justify-content-between">
      <button 
        className="btn btn-outline-warning" 
        onClick={onChefSignup}
      >
        Register as a Chef
      </button>
      <button 
        className="btn btn-outline-warning" 
        onClick={onCustomerSignup}
      >
        Customer Sign Up
      </button>
    </div>
  );
}
