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
import { format, addDays, startOfDay, startOfWeek } from 'date-fns';

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
  const [selectedSlots, setSelectedSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      fetchResource();
      fetchBookings();
      
      // Set up subscription
      const channel = supabase
        .channel(`booking-changes-${resourceId}`)
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

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [resourceId]);

  useEffect(() => {
    if (resourceId) {
      fetchBookings();
    }
  }, [selectedDate.getMonth(), selectedDate.getFullYear(), resourceId]);

  // Scroll to top when component mounts or resourceId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resourceId]);

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
      // Get the first day of the month for the selected date
      const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      // Get the last day of the month
      const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      // Get the start of the week for the first day (Sunday)
      const startOfWeekFirst = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
      // Get the end of the week for the last day (Saturday)
      const endOfWeekLast = addDays(startOfWeek(lastDayOfMonth, { weekStartsOn: 0 }), 6);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('start_time', startOfWeekFirst.toISOString())
        .lte('start_time', endOfWeekLast.toISOString())
        .eq('status', 'confirmed');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
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
    
    console.log('Setting time slot:', { start, end });
    
    // Replace existing selection with new slot (only allow 1 slot per booking)
    setSelectedSlots([{ start, end }]);
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlots([]);
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
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!resource) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
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
      <div className="min-h-screen bg-gray-50 pt-16">
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
              {/* AI Generated Image Section */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">
                      {resource.type === 'room' && '🏢'}
                      {resource.type === 'equipment' && '🔧'}
                      {resource.type === 'vehicle' && '🚗'}
                      {resource.type === 'facility' && '🏟️'}
                      {resource.type === 'lab' && '🧪'}
                      {resource.type === 'studio' && '🎨'}
                      {resource.type === 'auditorium' && '🎭'}
                      {resource.type === 'gym' && '💪'}
                      {resource.type === 'library' && '📚'}
                      {resource.type === 'cafeteria' && '🍽️'}
                      {!['room', 'equipment', 'vehicle', 'facility', 'lab', 'studio', 'auditorium', 'gym', 'library', 'cafeteria'].includes(resource.type) && '🏛️'}
                    </div>
                    <div className="text-2xl font-bold">{resource.name}</div>
                  </div>
                </div>
              </div>
              
              {/* Information Section */}
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
            selectedSlots={selectedSlots}
            onTimeSlotSelect={handleTimeSlotSelect}
            onClearSelection={handleClearSelection}
            resource={resource}
          />

          {/* Book Selected Slots Button */}
          {selectedSlots.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowBookingModal(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Time Slot
              </Button>
            </div>
          )}

          {showBookingModal && selectedSlots.length > 0 && (
            <BookingModal
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              resource={resource}
              timeSlots={selectedSlots}
              onSuccess={handleBookingSuccess}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarView;
