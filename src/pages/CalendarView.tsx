import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import { format, addDays, startOfWeek, isBefore, addWeeks, subWeeks } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  tags: string[];
  capacity: number;
}

interface Booking {
  id:string;
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
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  useEffect(() => {
    if (resourceId) {
      fetchBookings();
      const channel = supabase
        .channel(`booking-changes-${resourceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `resource_id=eq.${resourceId}` },
          () => fetchBookings()
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [resourceId, week]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resourceId]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();
      if (error) throw error;
      setResource(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load resource details" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    const start = week;
    const end = addDays(week, 6);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .eq('status', 'confirmed');
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleTimeSlotSelect = (start: Date, end: Date) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please sign in to make a booking" });
      return;
    }
    
    const newSlot = { start, end };
    
    // Handle deselection by clearing all slots to enforce a new contiguous selection
    const slotIndex = selectedSlots.findIndex(s => s.start.getTime() === newSlot.start.getTime());
    if (slotIndex !== -1) {
    setSelectedSlots([]);
      return;
    }

    // Handle new selection
    if (selectedSlots.length === 0) {
      setSelectedSlots([newSlot]);
    } else {
      const firstSlot = selectedSlots[0];
      const lastSlot = selectedSlots[selectedSlots.length - 1];

      if (newSlot.end.getTime() === firstSlot.start.getTime()) {
        // New slot is contiguous at the beginning
        setSelectedSlots([newSlot, ...selectedSlots]);
      } else if (newSlot.start.getTime() === lastSlot.end.getTime()) {
        // New slot is contiguous at the end
        setSelectedSlots([...selectedSlots, newSlot]);
      } else {
        // Not contiguous, so start a new selection
        setSelectedSlots([newSlot]);
      }
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedSlots([]);
    fetchBookings();
  };

  const formatSelectedSlots = () => {
    if (selectedSlots.length === 0) {
      return null;
    }

    if (selectedSlots.length === 1) {
      return `Time Selected: ${format(selectedSlots[0].start, 'p')} - ${format(selectedSlots[0].end, 'p')} on ${format(selectedSlots[0].start, 'MMM d')}`;
    }

    let isContiguous = true;
    for (let i = 0; i < selectedSlots.length - 1; i++) {
      if (selectedSlots[i].end.getTime() !== selectedSlots[i + 1].start.getTime()) {
        isContiguous = false;
        break;
      }
    }

    if (isContiguous) {
      const firstSlot = selectedSlots[0];
      const lastSlot = selectedSlots[selectedSlots.length - 1];
      return `Time Selected: ${format(firstSlot.start, 'p')} - ${format(lastSlot.end, 'p')} on ${format(firstSlot.start, 'MMM d')}`;
    }

    return `${selectedSlots.length} time slots selected`;
  };

  const renderTimeSlots = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8am to 11pm
    const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
    const now = new Date();

    return hours.map(hour => (
      <tr key={hour}>
        <td className="p-2 text-sm text-center text-gray-500">{`${hour}:00`}</td>
        {days.map(day => {
          const slotStart = new Date(day.setHours(hour, 0, 0, 0));
          const slotEnd = new Date(day.setHours(hour + 1, 0, 0, 0));
          const isPast = isBefore(slotStart, now);
          const booking = bookings.find(b => {
            const bookingStart = new Date(b.start_time);
            return bookingStart.getTime() === slotStart.getTime();
          });
          const isSelected = selectedSlots.some(s => s.start.getTime() === slotStart.getTime());

          let status = 'Available';
          if (isPast) status = 'Past';
          if (booking) status = 'Booked';

          return (
            <td key={day.toISOString()} className="border border-gray-200">
              <button
                disabled={status !== 'Available'}
                onClick={() => handleTimeSlotSelect(slotStart, slotEnd)}
                className={`w-full h-12 text-xs text-center transition-colors
                  ${status === 'Past' ? 'bg-gray-100 text-gray-400' : ''}
                  ${status === 'Available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                  ${status === 'Booked' ? 'bg-red-200 text-red-800 cursor-not-allowed' : ''}
                  ${isSelected ? '!bg-blue-500 !text-white' : ''}
                `}
              >
                {status}
              </button>
            </td>
          );
        })}
      </tr>
    ));
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
        <div className="min-h-screen flex items-center justify-center pt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Resource not found</h2>
          <Button onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{resource.name}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-500" />{resource.location}</div>
                <div className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-500" />Capacity: {resource.capacity}</div>
                <div className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />{resource.type}</div>
                </div>
              </CardContent>
            </Card>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center"><Clock className="h-6 w-6 mr-2" />Weekly Calendar</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setWeek(subWeeks(week, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-lg font-semibold">{format(week, 'MMMM yyyy')}</span>
                <Button variant="outline" size="icon" onClick={() => setWeek(addWeeks(week, 1))}><ChevronRight className="h-4 w-4" /></Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="ml-2">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Select Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={week}
                      onSelect={(date) => {
                        if (date) {
                          setWeek(startOfWeek(date, { weekStartsOn: 1 }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
          </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-sm font-semibold">Time</th>
                  {Array.from({ length: 7 }, (_, i) => addDays(week, i)).map(day => (
                    <th key={day.toISOString()} className="p-2  text-sm font-semibold">
                      {format(day, 'EEE')} <br /> {format(day, 'd')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderTimeSlots()}
              </tbody>
            </table>
            
          {selectedSlots.length > 0 && (
              <div className="mt-6 text-center">
                <p className="font-semibold mb-4">
                  {formatSelectedSlots()}
                </p>
                <Button className="bg-[#27548A] hover:bg-[#111924] text-white" size="lg" onClick={() => setShowBookingModal(true)}>Book Now</Button>
            </div>
          )}
          </div>
        </div>
      </div>

      {showBookingModal && (
            <BookingModal
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              resource={resource}
              timeSlots={selectedSlots}
              onSuccess={handleBookingSuccess}
            />
          )}
    </>
  );
};

export default CalendarView;
