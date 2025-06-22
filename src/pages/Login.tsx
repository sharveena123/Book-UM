import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { ShineBorder } from '@/components/magicui/shine-border';
import RippleButton from '@/components/animata/button/ripple-button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="absolute top-8 left-8 text-[#27548A] hover:text-[#183B4E]">
            &larr; Back 
        </Link>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-[#27548A]" />
          <h2 className="mt-6 text-3xl font-extrabold text-[#183B4E]">Sign in to your account</h2>
          <p className="mt-2 text-sm text-[#27548A]">
            Or{' '}
            <Link to="/register" className="font-medium text-[#27548A] hover:text-[#183B4E]">
              create a new account
            </Link>
          </p>
        </div>

        <div className="relative rounded-xl bg-white shadow-sm border border-transparent text-card-foreground">
          <ShineBorder
            borderWidth={2}
            duration={10}
            shineColor={["#27548A", "#DDA853", "#183B4E"]}
          />
          <CardHeader>
            <CardTitle className="text-[#183B4E]">Welcome back</CardTitle>
            <CardDescription className="text-[#27548A]">Enter your credentials to access your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#27548A] text-[#183B4E]"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#27548A] text-[#183B4E]"
                />
              </div>
              <div className="flex justify-center">

              <RippleButton type="submit"  disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </RippleButton>
              </div>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default Login;
