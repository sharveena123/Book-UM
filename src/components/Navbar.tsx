import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, FileCog, Home, BookOpen, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past the top 100px
        setIsVisible(false);
      } else {
        // Scrolling up or at the top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-[#27548A] transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-[#27548A]" />
              <span className="text-xl font-bold text-[#183B4E]">Book@UM</span>
            </Link>
            
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[#183B4E] hover:text-[#27548A] hover:bg-white"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                to="/resources" 
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[#183B4E] hover:text-[#27548A] hover:bg-white"
                >
              <FileCog className="h-4 w-4" />
              <span>Resources</span>
            </Link>
                <Link 
                  to="/my-bookings" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[#183B4E] hover:text-[#27548A] hover:bg-white"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Bookings</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-[#183B4E] hover:text-[#27548A] hover:bg-white"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-[#183B4E]">Welcome, {user.email}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-[#183B4E] hover:text-[#27548A] hover:bg-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-[#183B4E] hover:text-[#27548A] hover:bg-white">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#27548A] hover:bg-[#183B4E] text-white">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
