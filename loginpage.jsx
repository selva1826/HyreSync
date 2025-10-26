import { useState, useEffect } from 'react';
// Assuming 'api' is configured in '../utils/api' as in your original file
// import api from '../utils/api'; 

// --- MOCK API FOR PREVIEW ---
// We'll create a mock api object to allow the component to render and be tested
// without the actual '../utils/api' file.
const api = {
  post: (endpoint, formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (formData.email === "error@example.com") {
          // Simulate an API error
          reject({
            userMessage: "Invalid credentials.",
            response: { data: { error: "Invalid credentials." } }
          });
        } else {
          // Simulate a successful login/register
          resolve({
            data: {
              token: "mock-jwt-token-12345",
              user: {
                id: "user-1",
                email: formData.email,
                firstName: formData.firstName || "Test",
                lastName: formData.lastName || "User",
              }
            }
          });
        }
      }, 1000); // Simulate network delay
    });
  }
};
// --- END MOCK API ---


// Assuming these icons are available or replaced with your preferred icons
// You can use 'lucide-react' or emoji as in your original
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Background images array
  const backgrounds = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80',
  ];

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  // Validation function (unchanged from your original)
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isRegister) {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.phone) {
        errors.phone = 'Phone is required';
      } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
        errors.phone = 'Invalid phone format';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (unchanged from your original)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const { data } = await api.post(endpoint, formData);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(
        err.userMessage || err.response?.data?.error || 'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input change (unchanged from your original)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  // Toggle form mode (unchanged from your original)
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setValidationErrors({});
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
  };

  /**
   * Helper function to create input classes with validation
   * This simplifies the JSX and makes it easier to maintain
   */
  const getInputClasses = (fieldName) => {
    const baseClasses =
      'w-full px-4 py-3 rounded-xl bg-white/70 border-2 border-transparent focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm';
    const errorClasses = 'border-red-500 focus:border-red-500';
    return `${baseClasses} ${
      validationErrors[fieldName] ? errorClasses : 'border-gray-300/30'
    }`;
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans">
      {/* LEFT PANEL - Visuals */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        {/* Animated Background Slideshow */}
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 flex flex-col justify-end p-20 text-white h-full">
          <h1 className="text-7xl font-bold mb-4 drop-shadow-lg animate-fadeInUp">
            HyreSync
          </h1>
          <p className="text-3xl font-light text-gray-200 drop-shadow-lg animate-fadeInUp stagger-1">
            Sync Your Hireflow.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Login/Register Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 bg-gray-100">
        <div className="w-full max-w-md animate-fadeInRight">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">HyreSync</h1>
            <p className="text-gray-600 text-lg">Sync Your Hireflow.</p>
          </div>

          {/* Form Card - Glassmorphism */}
          <div className="w-full bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/50">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isRegister
                ? 'Get started in seconds.'
                : 'Sign in to your account.'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-600 rounded-lg animate-shake">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Register Fields */}
              {isRegister && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={getInputClasses('firstName')}
                        placeholder="John"
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1">
                          {validationErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={getInputClasses('lastName')}
                        placeholder="Doe"
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">
                          {validationErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={getInputClasses('phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClasses('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${getInputClasses('password')} pr-12`}
                    placeholder="••••••••"
                    autoComplete={
                      isRegister ? 'new-password' : 'current-password'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    {isRegister ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  <span className="text-lg">
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </span>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
                >
                  {isRegister ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


