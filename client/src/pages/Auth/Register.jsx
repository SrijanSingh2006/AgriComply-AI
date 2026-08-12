import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Farmer' // Default Value
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords mismatch");
      return;
    }
    
    setLoading(true);
    // Pass 'role' to the auth function
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    setLoading(false);

    if (result.success) {
      alert("Registration Successful!");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-2">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* NEW: Role Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">I am a:</label>
            <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            >
                <option value="Farmer">Individual Farmer</option>
                <option value="FPO">FPO / Cooperative</option>
                <option value="MSME">Agri-Business (MSME)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="confirmPassword" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" required />
          </div>
          
          <Button variant="primary" className="w-full mt-4" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;