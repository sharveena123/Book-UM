import { Marquee } from "@/components/magicui/marquee";
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import  {MarqueeDemo}  from "@/components/magicui/MarqueeDemo";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import RotatingText from "@/components/magicui/RotatingText";
import { motion } from "framer-motion";
import BlurryBlob from "@/components/animata/background/blurry-blob"; // adjust path if needed
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import Eight from "@/components/animata/bento-grid/eight";
import Carousel from "@/components/animata/progress/carousel";
import  {TextReveal}  from "@/components/animata/text/textreveal";


const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book resources with just a few clicks using our intuitive calendar interface"
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "See live availability and get instant confirmations for your bookings"
    },
    {
      icon: MapPin,
      title: "Multiple Locations",
      description: "Access facilities across campus including sports courts, study rooms, and labs"
    },
    {
      icon: Users,
      title: "Group Bookings",
      description: "Book for individuals or groups with capacity management"
    }
  ];

  const facilities = [
    { name: "Study Pods", icon: "📚", description: "Quiet private spaces for focused study" },
    { name: "Meeting Rooms", icon: "🏢", description: "Professional spaces for team collaboration" },
    { name: "Sports Courts", icon: "🏸", description: "Badminton, tennis, and basketball courts" },
    { name: "Fitness Areas", icon: "💪", description: "Gym facilities and yoga studios" },
    { name: "Lab Equipment", icon: "🔬", description: "Specialized equipment for research" },
    { name: "Swimming Pool", icon: "🏊", description: "Olympic-size pool with lane booking" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "Book@UM made it so easy to reserve study pods during exam season. The real-time availability is a game changer!",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Research Professor",
      content: "Booking lab equipment has never been easier. The system prevents conflicts and sends helpful reminders.",
      rating: 5
    },
    {
      name: "Lisa Williams",
      role: "Sports Enthusiast",
      content: "I love how I can book badminton courts weeks in advance. The QR code feature is super convenient!",
      rating: 5
    }
  ];

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Book@UM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
{/* Hero Section */}
<section className="relative w-full py-40 min-h-[350px] overflow-hidden px-10">
      {/* 🌀 Animated Gradient Background */}
      <BlurryBlob
  className="absolute z-0 pointer-events-none"
  firstBlobColor="bg-yellow-300"
  secondBlobColor="bg-blue-300"
firstBlobClassName="top-10 left-0"
  secondBlobClassName="top-40 right-10"
/>
      {/* 🧱 Main Content */}
      <div className="relative w-full h-full px-6 py-10 flex flex-col justify-start items-start">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center w-full gap-12">
            
            {/* 📌 Left Content */}
            <div className="text-left max-w-xl text-center">
              <div className="text-7xl sm:text-7xl font-bold text-gray-900 mb-2">
                <span>Book </span>
                <RotatingText
                  texts={["rooms", "facilities", "labs", "pods"]}
                  mainClassName="inline-flex px-3 bg-[#DDA853] text-white overflow-hidden py-1 items-center rounded-lg transition-all duration-300"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
                <span> instantly</span>
              </div>

              <p className="text-xl text-center text-gray-700 mb-6">
                Say goodbye to double bookings and miscommunications. Our app ensures instant, reliable room reservations with a few clicks.
              </p>

              <div className="flex justify-center gap-4">
                <Link to="/register">
                <InteractiveHoverButton>
                  Start Booking                
                </InteractiveHoverButton>
                </Link>
              </div>
            </div>

            {/* 🔥 Animation or Image */}
            <div className="relative z-10 w-full lg:w-1/2">
            <DotLottieReact
                src="https://lottie.host/075e17c2-b72d-43b7-bd1d-9836d7ff49e7/ANkHYUdiRH.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
      
    </section>
    <section className="py-16 px-10 bg-white">
      <Eight />
    </section>

    <section className="py-16 px-10 bg-white">
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Book@UM?</h2>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Our platform is designed to make resource booking simple, efficient, and reliable
    </p>
  </div>

  {/* Centering container */}
  <div
    className="flex items-center justify-center w-full"
    style={{ height: '600px' }}
  >
    <Carousel
      baseWidth={600}
      autoplay={true}
      autoplayDelay={4000}
      pauseOnHover={false}
      loop={true}
      round={false}
    />
  </div>
</section>

{/* Text Reveal Section */}
<section className="py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-9xl mx-auto space-y-6 text-center">
        <TextReveal>
        From focused study sessions and collaborative meetings to lively sports and vibrant campus events — your perfect space is only a few taps away with seamless booking, instant confirmations, and zero hassle        </TextReveal>
      </div>
    </section>
      {/* Facilities Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Facilities</h2>
            <p className="text-gray-600">Book from a wide range of campus resources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{facility.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                    <p className="text-gray-600 text-sm">{facility.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

 
      {/* reviews */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-center mb-6">What our users say</h2>
        <MarqueeDemo />
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the thousands of users who trust Book@UM for their resource booking needs
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6" />
                <span className="text-lg font-bold">Book@UM</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making campus resource booking simple and efficient for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Real-time Booking</li>
                <li>Calendar Integration</li>
                <li>Email Notifications</li>
                <li>QR Code Check-in</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Study Spaces</li>
                <li>Sports Facilities</li>
                <li>Lab Equipment</li>
                <li>Meeting Rooms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p style={{margin: 0, color: '#666'}}>&copy; 2024 Book@UM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
