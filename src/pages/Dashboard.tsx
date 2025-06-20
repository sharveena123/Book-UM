import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Users, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { format, addDays, startOfDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
  tags?: string[];
  capacity?: number;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

const DAYS_TO_SHOW = 7;
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

const Dashboard: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Quick Book state
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [quickBookStep, setQuickBookStep] = useState(1);
  const [timePage, setTimePage] = useState(0);
  const [paginatedTimes, setPaginatedTimes] = useState<string[]>([]);
  const [endOfTimes, setEndOfTimes] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);
  const TIMES_PER_PAGE = 4;

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType]);

  // Fetch resource types and resources
  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase.from('resources').select('id, name, type, location');
      if (data) {
        setResources(data);
        setResourceTypes(Array.from(new Set(data.map((r: Resource) => r.type))));
      }
    };
    fetchResources();
  }, []);

  // Filter resources by selected type
  useEffect(() => {
    if (selectedType) {
      setFilteredResources(resources.filter(r => r.type === selectedType));
      setSelectedResourceId('');
    } else {
      setFilteredResources([]);
      setSelectedResourceId('');
    }
    setSelectedDate(undefined);
    setSelectedTime('');
  }, [selectedType, resources]);

  // When a place is selected, fetch bookings and set available dates
  useEffect(() => {
    if (!selectedResourceId) {
      setAvailableDates([]);
      setSelectedDate(undefined);
      setSelectedTime('');
      setBookings([]);
      return;
    }
    // Show next 7 days
    const today = startOfDay(new Date());
    const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => format(addDays(today, i), 'yyyy-MM-dd'));
    setAvailableDates(days);
    setSelectedDate(undefined);
    setSelectedTime('');
    // Fetch bookings for this resource in the next 7 days
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .eq('resource_id', selectedResourceId)
        .gte('start_time', days[0] + 'T00:00:00')
        .lt('start_time', days[days.length - 1] + 'T23:59:59')
        .eq('status', 'confirmed');
      setBookings(data || []);
    };
    fetchBookings();
  }, [selectedResourceId]);

  // When a date is selected, compute available time slots
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      setSelectedTime('');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    // Find booked time slots for this date
    const bookedTimes = bookings
      .filter(b => format(new Date(b.start_time), 'yyyy-MM-dd') === dateStr)
      .map(b => format(new Date(b.start_time), 'HH:mm'));
    // Only show slots not already booked
    const times = TIME_SLOTS.filter(t => !bookedTimes.includes(t));
    setAvailableTimes(times);
    setSelectedTime('');
  }, [selectedDate, bookings]);

  // Paginate availableTimes for the time picker
  useEffect(() => {
    const start = timePage * TIMES_PER_PAGE;
    const end = start + TIMES_PER_PAGE;
    setPaginatedTimes(availableTimes.slice(start, end));
    setEndOfTimes(end >= availableTimes.length);
  }, [availableTimes, timePage]);

  // Reset timePage when selectedDate changes
  useEffect(() => {
    setTimePage(0);
  }, [selectedDate]);

  // Disable 'Next' button if selection is missing
  useEffect(() => {
    if (quickBookStep === 1) setNextDisabled(!selectedType);
    else if (quickBookStep === 2) setNextDisabled(!selectedResourceId);
    else if (quickBookStep === 3) setNextDisabled(!selectedDate);
    else setNextDisabled(false);
  }, [quickBookStep, selectedType, selectedResourceId, selectedDate]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (error) throw error;

      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resources"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handlePrevTimePage = () => {
    if (timePage > 0) {
      setTimePage(timePage - 1);
    }
  };

  const handleNextTimePage = () => {
    if (!endOfTimes) {
      setTimePage(timePage + 1);
    }
  };

  const handleQuickBook = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'Please sign in to make a booking.'
      });
      return;
    }
    if (!selectedResourceId || !selectedDate || !selectedTime) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select category, place, date, and time.'
      });
      return;
    }
    try {
      // Calculate start and end time (assume 1 hour duration)
      const [hour, minute] = selectedTime.split(':');
      const start = new Date(selectedDate);
      start.setHours(Number(hour), Number(minute), 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        resource_id: selectedResourceId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'confirmed'
      });
      if (error) throw error;
      toast({
        title: 'Booking confirmed',
        description: 'Your booking has been successfully created.'
      });
      // Reset quick book state
      setShowQuickBook(false);
      setQuickBookStep(1);
      setSelectedType('all');
      setSelectedResourceId('');
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking failed',
        description: 'Failed to create booking. Please try again.'
      });
    }
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Quick Book Button and Dialog */}
          <div className="mb-6">
            <Button
              className="px-6 py-3 text-lg font-semibold rounded-full bg-primary text-white shadow hover:bg-primary/90 transition"
              onClick={() => setShowQuickBook(true)}
            >
              Quick Book
            </Button>
            <Dialog open={showQuickBook} onOpenChange={setShowQuickBook}>
              <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle>Quick Book</DialogTitle>
                  <DialogDescription>
                    Book a resource in a few quick steps.
                  </DialogDescription>
                </DialogHeader>
                {/* Step 1: Category */}
                {quickBookStep === 1 && (
                  <div className="space-y-4">
                    <label className="block font-medium mb-1">Category</label>
                    <select
                      className="border rounded px-3 py-2 w-full"
                      value={selectedType}
                      onChange={e => {
                        setSelectedType(e.target.value);
                        setQuickBookStep(2);
                      }}
                    >
                      <option value="">Select category</option>
                      {resourceTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Step 2: Place */}
                {quickBookStep === 2 && (
                  <div className="space-y-4">
                    <label className="block font-medium mb-1">Place</label>
                    <select
                      className="border rounded px-3 py-2 w-full"
                      value={selectedResourceId}
                      onChange={e => {
                        setSelectedResourceId(e.target.value);
                        setQuickBookStep(3);
                      }}
                    >
                      <option value="">Select place</option>
                      {filteredResources.map(resource => (
                        <option key={resource.id} value={resource.id}>{resource.name} ({resource.location})</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Step 3: Date */}
                {quickBookStep === 3 && (
                  <div className="space-y-4">
                    <label className="block font-medium mb-1">Date</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => {
                        setSelectedDate(date);
                        setQuickBookStep(4);
                      }}
                      fromDate={new Date()}
                      toDate={addDays(new Date(), DAYS_TO_SHOW - 1)}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
                {/* Step 4: Time (Horizontal with arrows) */}
                {quickBookStep === 4 && (
                  <div className="space-y-4">
                    <label className="block font-medium mb-1">Time</label>
                    <div className="w-full max-w-xs mx-auto">
                      <div className="flex gap-2 overflow-x-auto pb-2 items-center justify-center">
                        {availableTimes.map(time => (
                          <button
                            key={time}
                            className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${selectedTime === time ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary/10'}`}
                            onClick={() => setSelectedTime(time)}
                            type="button"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Step 5: Book Button */}
                {quickBookStep === 4 && selectedTime && (
                  <div className="pt-4">
                    <Button className="w-full" onClick={handleQuickBook}>
                      Book
                    </Button>
                  </div>
                )}
                {/* Step navigation (optional) */}
                <div className="flex justify-between pt-4">
                  {quickBookStep > 1 && (
                    <Button variant="ghost" onClick={() => setQuickBookStep(quickBookStep - 1)}>
                      Back
                    </Button>
                  )}
                  {quickBookStep < 4 && (
                    <Button variant="ghost" onClick={() => setQuickBookStep(quickBookStep + 1)} disabled={nextDisabled}>
                      Next
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Rebook Suggestions Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Rebook Suggestions</h2>
            <div className="text-gray-600">[Suggestions based on completed bookings or random resources]</div>
          </section>

          {/* Upcoming/Completed Booking Preview Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
            <div className="text-gray-600">[Preview of upcoming and completed bookings]</div>
          </section>

          {/* Analytics Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <div className="text-gray-600 mb-4">[Pie chart of most used resources]</div>
            <div className="text-gray-600">[Other engaging stats and charts]</div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
