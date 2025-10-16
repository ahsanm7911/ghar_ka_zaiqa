import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function CustomerSignup({ goBack }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        user_type: "customer",
        address: "",
        phone_number: "",
        dietary_preferences: ""
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
                <h3 className="mb-3">Customer Sign Up</h3>

                {error && (
                    <div className="alert alert-danger">{JSON.stringify(error)}</div>
                )}

                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        placeholder="John Doe"
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
                        placeholder="customer@example.com"
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
                    <label className="form-label">Address</label>
                    <textarea
                        className="form-control"
                        name="address"
                        placeholder="Enter your full address (street, city, zip code)"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>


                <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="phone_number"
                        placeholder="+1 555 123 4567"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Dietary Preferences</label>
                    <textarea
                        className="form-control"
                        name="dietary_preferences"
                        placeholder="Vegetarian, Vegan, Gluten-free, etc."
                        value={formData.dietary_preferences}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Register as Customer
                </button>
                <button type="button" className="btn btn-secondary w-100 mt-3" onClick={goBack}>
                    Back to Login
                </button>
            </form>
        </div>
    );
}
