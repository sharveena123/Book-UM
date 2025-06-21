
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import RippleButton from '@/components/animata/button/ripple-button';
import { ShineBorder } from '@/components/magicui/shine-border';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
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
    
    const { error } = await signUp(email, password, fullName);
    
    if (!error) {
      navigate('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-[#27548A]" />
          <h2 className="mt-6 text-3xl font-extrabold text-[#183B4E]">Create your account</h2>
          <p className="mt-2 text-sm text-[#27548A]">
            Or{' '}
            <Link to="/login" className="font-medium text-[#27548A] hover:text-[#183B4E]">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <div className="relative rounded-xl">
        <ShineBorder
          borderWidth={2}
          duration={10}
          shineColor={["#27548A", "#DDA853", "#183B4E"]}
          className="z-0"
        />
        <Card className="bg-white border-[#27548A]">
          <CardHeader>
            <CardTitle className="text-[#183B4E]">Get started</CardTitle>
            <CardDescription className="text-[#27548A]">Create your account to start booking resources</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-[#27548A] text-[#183B4E]"
                />
              </div>
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
                  minLength={6}
                  className="border-[#27548A] text-[#183B4E]"
                />
              </div>
              <div className="flex justify-center">
              <RippleButton type="submit"  disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </RippleButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Register;
