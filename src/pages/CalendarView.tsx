import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import CalendarGrid from '@/components/CalendarGrid';
import { format, addDays, startOfDay } from 'date-fns';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  tags: string[];
  capacity: number;
  image?: string;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
}

const CalendarView: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      fetchResource();
      fetchBookings();
      subscribeToBookings();
    }
  }, [resourceId]);

  useEffect(() => {
    if (resourceId) {
      fetchBookings();
    }
  }, [selectedDate, resourceId]);

  const fetchResource = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) throw error;
      setResource(data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resource details"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const startDate = startOfDay(selectedDate);
      const endDate = addDays(startDate, 7);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .eq('status', 'confirmed');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `resource_id=eq.${resourceId}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTimeSlotSelect = (start: Date, end: Date) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to make a booking"
      });
      return;
    }

    setSelectedTimeSlot({ start, end });
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedTimeSlot(null);
    fetchBookings();
    toast({
      title: "Booking confirmed",
      description: "Your booking has been successfully created"
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!resource) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource not found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Card>
              <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden mb-2">
                <img
                  src={resource.image || '/public/images/placeholder.svg'}
                  alt={resource.name}
                  className="object-cover w-full h-full"
                  onError={e => (e.currentTarget.src = '/public/images/placeholder.svg')}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{resource.name}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {resource.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    Capacity: {resource.capacity}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <CalendarGrid
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            bookings={bookings}
            onTimeSlotSelect={handleTimeSlotSelect}
          />

          {showBookingModal && selectedTimeSlot && (
            <BookingModal
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              resource={resource}
              timeSlot={selectedTimeSlot}
              onSuccess={handleBookingSuccess}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarView;
