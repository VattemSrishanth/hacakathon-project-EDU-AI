import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import './login-animation.css';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [active, setActive] = useState(false); // ✅ FIX 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authAPI.login(email, password);
      if (response?.success) {
        setSuccessMessage('Login successful!');
      } else {
        setErrorMessage(response?.error || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
      <div className={`auth-container ${active ? 'active' : ''}`}>

        {/* LEFT: FORMS */}
        <div className="form-container">

          {/* LOGIN */}
          <div className="form-box login animation">
            <Card>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-700 mt-2">Sign in to your account</p>
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              {/* ✅ FIX 2: INPUTS RESTORED */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <p className="text-center text-gray-700 mt-6">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActive(true)}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </Card>
          </div>

          {/* SIGNUP PLACEHOLDER */}
          <div className="form-box register animation">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create Account
              </h2>
              <p className="text-gray-700 mb-6">
                Signup form goes here
              </p>

              <button
                type="button"
                onClick={() => setActive(false)}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </Card>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="info-panel">
          <h1>WELCOME BACK!</h1>
          <p>
            We are happy to have you with us again.
            If you need anything, we are here to help.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
