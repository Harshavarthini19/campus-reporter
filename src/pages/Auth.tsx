import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, signup, isLoading } = useAuth();
  const { toast } = useToast();

  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsSignup(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 gradient-primary rounded-xl animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup) {
      if (!formData.name) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignup) {
        const result = await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          department: formData.department,
        });

        if (result.success) {
          toast({
            title: 'Account created!',
            description: 'Welcome to Campus Reporter.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Signup failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const result = await login(formData.email, formData.password);

        if (result.success) {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Login failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">CR</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSignup ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignup
                ? 'Start reporting and tracking campus issues today.'
                : 'Sign in to continue to Campus Reporter.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div>
                  <Label htmlFor="name" className="form-label">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.name ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department" className="form-label">
                    Department
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="Computer Science"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.department ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.department && (
                    <p className="text-sm text-destructive mt-1">{errors.department}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="form-label">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {isSignup && (
              <div>
                <Label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-primary py-6 text-base"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary font-medium hover:underline"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {!isSignup && (
            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Demo accounts:</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Admin:</span> admin@campus.edu / admin123</p>
                <p><span className="font-medium">Student:</span> student@campus.edu / student123</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Making Campus Life Better, Together
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Report issues, track progress, and collaborate with administration to create a safer, more functional campus environment.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center"
                >
                  <span className="text-sm font-medium">{String.fromCharCode(64 + i)}</span>
                </div>
              ))}
            </div>
            <p className="text-sm opacity-90">Join 10,000+ active users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
