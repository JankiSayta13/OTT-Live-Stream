
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [channelName, setChannelName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, signup, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup && !channelName) {
      newErrors.channelName = 'Channel name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    
    try {
      let result;
      
      if (isSignup) {
        result = await signup(email, password, channelName);
      } else {
        result = await login(email, password);
      }
      
      if (result.success) {
        toast({
          title: "Success!",
          description: isSignup ? "Account created successfully! Please check your email to verify your account." : "Welcome back!",
        });
        
        if (!isSignup) {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Video className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold text-white">StreamAI</span>
          </Link>
        </div>

        <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              {isSignup ? 'Create your channel' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isSignup 
                ? 'Start streaming with AI-powered features' 
                : 'Enter your credentials to access your channel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="channelName" className="text-white">Channel Name</Label>
                  <Input
                    id="channelName"
                    type="text"
                    placeholder="My Awesome Channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                      errors.channelName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.channelName && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.channelName}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isSignup ? 'Create Channel' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {isSignup ? 'Already have a channel?' : "Don't have a channel?"}{' '}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setErrors({});
                    setEmail('');
                    setPassword('');
                    setChannelName('');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
