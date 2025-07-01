import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, Sparkles, GraduationCap, Users, Award, TrendingUp, Flame } from 'lucide-react';
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/student');
    }
  }, [user, navigate]);
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(result.user.role === 'admin' ? '/admin' : '/student');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };


  const features = [
    {
      icon: Flame,
      title: 'NFPA Standards Training',
      description: 'Comprehensive courses aligned with National Fire Protection Association standards'
    },
    {
      icon: Award,
      title: 'Fire Safety Certifications',
      description: 'Earn industry-recognized NFPA certifications upon successful course completion'
    },
    {
      icon: TrendingUp,
      title: 'Professional Development',
      description: 'Track your fire safety expertise and advance your career in fire protection'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-red-400/20 to-yellow-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8 animate-fade-in-up">
            {/* Logo & Title */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden bg-white">
                  <img
                    src="/indus_fire_safety_private_limited_logo (2).jpeg"
                    alt="Indus Fire Safety Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent">
                    Indus LMS
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-600">Fire Safety Excellence</span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Forging Tomorrow's
                <span className="block text-2xl lg:text-3xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Fire Safety Champions
                </span>
              </h2>

              <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 mb-2">
                Join thousands of fire professionals in our comprehensive learning platform - the epicenter for cutting edge fire education and certification.
              </p>
              <p className="text-base text-gray-500 max-w-md mx-auto lg:mx-0">
                Aligned with NFPA Standards for professional excellence.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="animate-fade-in-scale">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 lg:p-10 max-w-md mx-auto">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-red-200/20 rounded-full blur-xl"></div>

              <div className="relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                  <p className="text-gray-600">Sign in to continue your fire safety education journey</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center animate-fade-in-scale">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                          placeholder="Enter your password"
                        />
                        <div
                          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff
                              className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;