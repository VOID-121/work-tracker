import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  BriefcaseIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <BriefcaseIcon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-2.5 w-2.5 text-yellow-700" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Work Tracker
          </h1>
          
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome back!</h2>
          
          <p className="text-sm text-gray-600 mb-6">
            Sign in to access your productivity dashboard
          </p>
          
          <div className="flex justify-center space-x-6 mb-8">
            <div className="flex items-center text-xs text-gray-500">
              <SparklesIcon className="h-4 w-4 text-green-500 mr-1" />
              Secure Login
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
              Trusted Platform
            </div>
          </div>
        </div>
        
        {/* Main Login Card */}
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-3xl border border-white/50 relative">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-700"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-700"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-3" />
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to your account</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Demo Accounts Section */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-600 font-medium rounded-full">Quick Demo Access</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => onSubmit({ email: 'user@example.com', password: 'user123' })}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-sm flex items-center justify-center"
                  disabled={loading}
                >
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Demo User Access
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">Standard</span>
                </button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create one now →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
