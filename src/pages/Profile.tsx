import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Clock, MapPin, Users, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<BookingStats>({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [favourites, setFavourites] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookingStats();
      fetchFavourites();
    }
  }, [user]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, start_time')
        .eq('user_id', user?.id);

      if (error) throw error;

      const now = new Date();
      const total = data?.length || 0;
      const upcoming = data?.filter(booking => 
        new Date(booking.start_time) > now && booking.status === 'confirmed'
      ).length || 0;
      const completed = data?.filter(booking => 
        new Date(booking.start_time) <= now || booking.status === 'completed'
      ).length || 0;

      setStats({ total, upcoming, completed });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const fetchFavourites = async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from('favourites')
      .select('resource_id, resources(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setFavourites(data.map((fav: any) => fav.resources));
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;

      await fetchProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and view booking statistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{fullName || 'User'}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Account Details
                </CardTitle>
                <CardDescription>Your account information and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Email</span>
                  </div>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Member since</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile && format(new Date(profile.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Booking Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-gray-600">Total Bookings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
                      <div className="text-xs text-gray-600">Upcoming</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favourites */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Favourites
                </CardTitle>
                <CardDescription>Your favourite resources</CardDescription>
              </CardHeader>
              <CardContent>
                {favourites.length === 0 ? (
                  <div className="text-gray-500">No favourites yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favourites.map(resource => (
                      <Card key={resource.id} className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle>{resource.name}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 flex items-center"><MapPin className="h-4 w-4 mr-1" />{resource.location}</span>
                            {resource.capacity && (
                              <span className="text-gray-500 flex items-center"><Users className="h-4 w-4 mr-1" />{resource.capacity}</span>
                            )}
                          </div>
                          {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.tags.map((tag: string) => (
                                <span key={tag} className="bg-gray-200 rounded-full px-2 py-0.5 text-xs mr-1">{tag}</span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
