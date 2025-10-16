import { div } from "framer-motion/client";
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";


export default function ChefSignup({ goBack }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "chef",
    bio: "",
    specialty: "",
    years_of_experience: 0,
    certification: ""
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/signup/', formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/activation-pending');
    } catch (error) {
      setError(error.response?.data || { detail: 'Signup Failed.' });
    }
  };

  return (
    <div className="card shadow rounded-4 p-4">

      <form onSubmit={handleSubmit} className="w-100">
        <h3 className="mb-3">Chef Sign Up</h3>

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="full_name"
            placeholder="Chef Gordon Ramsay"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="chef@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bio</label>
          <textarea
            className="form-control"
            name="bio"
            placeholder="Brief introduction about yourself"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Specialty</label>
          <input
            type="text"
            className="form-control"
            name="specialty"
            placeholder="Italian Cuisine, Desserts, Seafood, etc."
            value={formData.specialty}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Years of Experience</label>
          <input
            type="number"
            className="form-control"
            name="years_of_experience"
            placeholder="e.g., 5"
            value={formData.years_of_experience}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Certification</label>
          <input
            type="text"
            className="form-control"
            name="certification"
            placeholder="Culinary School Certificate"
            value={formData.certification}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Register as Chef
        </button>
        <button type="button" className="btn btn-secondary w-100 mt-3" onClick={goBack}>
          Back to Login
        </button>
      </form>
    </div>
  );
}
