import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Register: React.FC = () => {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      
      // Auto-login after registration
      login(response.token, {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as 'user' | 'admin'
      });
      
      if (response.user.role === 'admin') {
        nav('/admin/dashboard');
      } else {
        nav('/');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* <GlassHeader /> */}
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-10">
          Create Account
        </h1>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 shadow-lg">
          <form onSubmit={handle} className="space-y-6">
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              required
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating…" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/" className="text-purple-400 hover:underline">
              Click here
            </Link> {" "}
            to continue as a guest.
          </p>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

/* same Input & GlassHeader as Login.tsx – copy/paste or export/import */
const Input: React.FC<{ label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }> =
  ({ label, type = 'text', value, onChange, required }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );

const GlassHeader: React.FC = () => (
  <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Eventify</span>
    </div>
  </header>
);

export default Register;