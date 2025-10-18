'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase, AuthUser } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export function FinSightAuthComponent() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    // Set initial mode based on current path
    const path = window.location.pathname;
    if (path.includes('/signup')) return 'signup';
    return 'login';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'signup') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Store email for verification resend
          localStorage.setItem('finsight_signup_email', formData.email);
          
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            // Navigate to email verification page or dashboard
            navigate('/auth/verify-email');
          }, 2000);
        }
      } else {
        // Check if this is a demo login attempt
        const isDemoLogin = formData.email === 'demo@finsight.ai' && formData.password === 'demo123456';
        
        if (isDemoLogin) {
          // Handle demo login - create a mock session
          setShowSuccess(true);
          
          // Create a mock user for demo purposes
          const mockUser: AuthUser = {
            id: 'demo-user-id',
            email: 'demo@finsight.ai',
            user_metadata: {
              name: 'Demo User',
              full_name: 'Demo User'
            }
          };
          
          // Store demo user session
          localStorage.setItem('finsight_demo_user', JSON.stringify(mockUser));
          
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/dashboard');
          }, 1500);
        } else {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) throw error;

          if (data.user) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              navigate('/dashboard');
            }, 1500);
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    console.log('Demo login initiated');
    // Set demo credentials
    setFormData({
      ...formData,
      email: 'demo@finsight.ai',
      password: 'demo123456'
    });

    // Automatically submit with demo credentials
    setIsLoading(true);
    setError('');

    try {
      // Create a mock user for demo purposes
      const mockUser: AuthUser = {
        id: 'demo-user-id',
        email: 'demo@finsight.ai',
        user_metadata: {
          name: 'Demo User',
          full_name: 'Demo User'
        }
      };
      
      // Store demo user session
      localStorage.setItem('finsight_demo_user', JSON.stringify(mockUser));
      console.log('Demo user stored in localStorage');
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        console.log('Navigating to dashboard');
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Social login error:', err);
      setError(err instanceof Error ? err.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for demo user first
        const demoUser = localStorage.getItem('finsight_demo_user');
        if (demoUser) {
          console.log('Demo user found, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        // Check for Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Supabase session found, redirecting to dashboard');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.log('Auth state change:', event, session);
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen bg-[#0D0E12] relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0E12] via-[#1a1b2e] to-[#0D0E12]" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, #00F5D4 0%, transparent 70%)' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -30, 0],
            y: [0, -50, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Circuit pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #00F5D4 1px, transparent 1px),
              linear-gradient(0deg, #00F5D4 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-[#00F5D4]/20 to-[#0078FF]/20 backdrop-blur-xl border border-[#00F5D4]/30 rounded-2xl px-6 py-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-[#00F5D4]" />
            <span className="text-white font-medium">
              {authMode === 'login' ? 'Login successful!' : 'Account created successfully!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-2xl px-6 py-4 flex items-center gap-3"
          >
            <div className="w-6 h-6 text-red-400">⚠️</div>
            <span className="text-white font-medium">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center"
        style={{ perspective: 1500 }}
      >
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block space-y-6"
        >
          <div className="space-y-4">
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00F5D4]/10 to-[#6C63FF]/10 backdrop-blur-sm border border-[#00F5D4]/20 rounded-full px-4 py-2"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(0, 245, 212, 0.1)',
                  '0 0 40px rgba(0, 245, 212, 0.2)',
                  '0 0 20px rgba(0, 245, 212, 0.1)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Lightbulb className="w-5 h-5 text-[#00F5D4]" />
              <span className="text-sm text-[#00F5D4] font-medium">AI-Powered Analytics</span>
            </motion.div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#00F5D4] via-[#0078FF] to-[#6C63FF] bg-clip-text text-transparent">
              FinSight.AI
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              {authMode === 'login' 
                ? 'Sign in to manage your AI-powered GST insights.'
                : 'Create your account and unlock intelligent financial analytics.'}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5D4]/20 to-[#0078FF]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#00F5D4]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Smart GST Analysis</h3>
                <p className="text-gray-400 text-sm">AI-powered insights from your transaction files</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5D4]/20 to-[#0078FF]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#00F5D4]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Expense Tracking</h3>
                <p className="text-gray-400 text-sm">Automated categorization and reporting</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5D4]/20 to-[#0078FF]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#00F5D4]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Real-time Dashboard</h3>
                <p className="text-gray-400 text-sm">Monitor your finances with live updates</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            {/* Card glow */}
            <motion.div 
              className="absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              animate={{
                background: [
                  'linear-gradient(45deg, #00F5D4, #0078FF)',
                  'linear-gradient(90deg, #0078FF, #6C63FF)',
                  'linear-gradient(135deg, #6C63FF, #00F5D4)',
                  'linear-gradient(45deg, #00F5D4, #0078FF)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ filter: 'blur(20px)' }}
            />

            {/* Glass card */}
            <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/[0.08] shadow-2xl overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F5D4]/5 via-transparent to-[#6C63FF]/5 pointer-events-none" />

              {/* Mobile branding */}
              <div className="md:hidden mb-6 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00F5D4] via-[#0078FF] to-[#6C63FF] bg-clip-text text-transparent mb-2">
                  FinSight.AI
                </h1>
                <p className="text-sm text-gray-400">
                  {authMode === 'login' 
                    ? 'Sign in to your account'
                    : 'Create your account'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-white/5 rounded-2xl p-1 mb-6 backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => setAuthMode('login')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300",
                    authMode === 'login'
                      ? "bg-gradient-to-r from-[#00F5D4] to-[#0078FF] text-white shadow-lg shadow-[#00F5D4]/20" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300",
                    authMode === 'signup'
                      ? "bg-gradient-to-r from-[#00F5D4] to-[#0078FF] text-white shadow-lg shadow-[#00F5D4]/20" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative group/input">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#00F5D4] transition-colors z-10" />
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border-white/10 focus:border-[#00F5D4]/50 text-white placeholder:text-gray-500 h-12 pl-12 pr-4 rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-white/10"
                          required={authMode === 'signup'}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.1), transparent)',
                            filter: 'blur(10px)'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#00F5D4] transition-colors z-10" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border-white/10 focus:border-[#00F5D4]/50 text-white placeholder:text-gray-500 h-12 pl-12 pr-4 rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-white/10"
                    required
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.1), transparent)',
                      filter: 'blur(10px)'
                    }}
                  />
                </div>

                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#00F5D4] transition-colors z-10" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/5 border-white/10 focus:border-[#00F5D4]/50 text-white placeholder:text-gray-500 h-12 pl-12 pr-12 rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-white/10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00F5D4] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.1), transparent)',
                      filter: 'blur(10px)'
                    }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative group/input">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#00F5D4] transition-colors z-10" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full bg-white/5 border-white/10 focus:border-[#00F5D4]/50 text-white placeholder:text-gray-500 h-12 pl-12 pr-12 rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-white/10"
                          required={authMode === 'signup'}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00F5D4] transition-colors z-10"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <motion.div
                          className="absolute inset-0 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.1), transparent)',
                            filter: 'blur(10px)'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {authMode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00F5D4] focus:ring-[#00F5D4] focus:ring-offset-0"
                      />
                      <span className="text-gray-400 group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-[#00F5D4] hover:text-[#0078FF] transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00F5D4] to-[#0078FF] rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0078FF] to-[#6C63FF] rounded-xl opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-r from-[#00F5D4] to-[#0078FF] text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00F5D4]/30">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 group-hover/button:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-4 text-xs text-gray-500 font-medium">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5D4]/30 text-white font-medium h-11 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm">Google</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5D4]/30 text-white font-medium h-11 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm">GitHub</span>
                  </motion.button>
                </div>

                {/* Demo Login */}
                {authMode === 'login' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-[#00F5D4]/10 to-[#6C63FF]/10 backdrop-blur-sm border border-[#00F5D4]/20 rounded-xl"
                  >
                    <p className="text-xs text-gray-400 mb-2">Try Demo Account</p>
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="text-sm text-[#00F5D4] hover:text-[#0078FF] transition-colors font-medium flex items-center gap-1"
                    >
                      Use Demo Credentials
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </form>

              {/* Footer */}
              <p className="text-center text-sm text-gray-400 mt-6">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-[#00F5D4] hover:text-[#0078FF] font-semibold transition-colors"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Demo() {
  return <FinSightAuthComponent />;
}
