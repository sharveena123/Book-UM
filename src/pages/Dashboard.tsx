import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, CalendarCheck, CalendarX, Heart, Clock, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import AiButton from '@/components/animata/button/ai-button';
import BlurryBlob from "@/components/animata/background/blurry-blob"; // adjust path if needed
import { sendBookingEmail } from '@/lib/email';


interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  resources: Resource;
}

interface SuggestionItem {
  type: 'rebook' | 'suggestion';
  resource: Resource;
  bookingDetails?: Booking;
}

interface QuickBookBooking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface BookingStats {
  upcoming: number;
  completed: number;
}

interface Favourite {
    resource_id: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<BookingStats>({ upcoming: 0, completed: 0 });
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [suggestionList, setSuggestionList] = useState<SuggestionItem[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQuickBook, setShowQuickBook] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Quick Book State
    const [quickBookStep, setQuickBookStep] = useState(1);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [resourceTypes, setResourceTypes] = useState<string[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [selectedResourceType, setSelectedResourceType] = useState('');
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
    const [bookingsForResource, setBookingsForResource] = useState<QuickBookBooking[]>([]);
    const [quickBookEmailSent, setQuickBookEmailSent] = useState(false);

    const TIME_SLOTS = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00',
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) {
            fetchAllDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (location.state?.quickBookResourceId && allResources.length > 0) {
            const resourceId = location.state.quickBookResourceId;
            const resourceToBook = allResources.find(r => r.id === resourceId);

            if (resourceToBook) {
                setShowQuickBook(true);
                setQuickBookStep(1);
                setSelectedResourceType(resourceToBook.type);
                
                // Use timeout to ensure state propagation before setting resource ID
                setTimeout(() => {
                    setSelectedResourceId(resourceToBook.id);
                }, 100);

                // Clear location state to prevent re-triggering
                navigate('.', { replace: true, state: {} });
            }
        }
    }, [location.state, allResources, navigate]);

    const fetchAllDashboardData = async () => {
        setLoading(true);
        try {
            const resourceReq = supabase.from('resources').select('id, name, type, location');
            
            const [
                bookingStats, 
                favourites, 
                upcomingBookings, 
                completedBookings,
                analyticsData,
                allResourcesData
            ] = await Promise.all([
                supabase.from('bookings').select('start_time, status').eq('user_id', user!.id),
                supabase.from('favourites').select('resource_id').eq('user_id', user!.id),
                supabase.from('bookings').select(`*, resources(*)`).eq('user_id', user!.id).eq('status', 'confirmed').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(3),
                supabase.from('bookings').select('*, resources(*)').eq('user_id', user!.id).lt('end_time', new Date().toISOString()).order('end_time', { ascending: false }).limit(3),
                supabase.from('bookings').select('resources(name)').eq('user_id', user.id),
                resourceReq
            ]);

            // Process booking stats
            if(bookingStats.data) {
                const now = new Date();
                const upcoming = bookingStats.data.filter(b => b.status === 'confirmed' && isAfter(new Date(b.start_time), now)).length;
                const completed = bookingStats.data.filter(b => b.status === 'confirmed' && isBefore(new Date(b.start_time), now)).length;
                setStats({ upcoming, completed });
            }

            // Process favourites
            if(favourites.data) setFavourites(favourites.data as Favourite[]);
            
            // Process upcoming bookings
            if(upcomingBookings.data) setUpcomingBookings(upcomingBookings.data as Booking[]);
            
            // Process suggestions
            const completed = completedBookings.data || [];
            
            // This ensures we only get the most recent booking for each resource
            const uniqueBookings = Array.from(new Map(completed.map(b => [b.resources?.id, b])).values());

            const rebookItems: SuggestionItem[] = uniqueBookings
              .filter(booking => booking.resources) // Ensure resource is not null
              .map((booking: Booking) => ({
                type: 'rebook',
                resource: booking.resources,
                bookingDetails: booking,
            }));
            
            const rebookResourceIds = new Set(rebookItems.map(item => item.resource.id));
            
            let suggestionItems: SuggestionItem[] = [];
            const allResourceList = allResourcesData.data || [];
            const suggestionsToFetch = allResourceList.filter(r => !rebookResourceIds.has(r.id));
            const shuffled = suggestionsToFetch.sort(() => 0.5 - Math.random());
            const randomSuggestions = shuffled.slice(0, 3);

            suggestionItems = randomSuggestions.map((resource: Resource) => ({
                type: 'suggestion',
                resource: resource,
            }));

            setSuggestionList([...rebookItems, ...suggestionItems]);

            // Process analytics
            if(analyticsData.data) {
                const bookingCounts = analyticsData.data.reduce((acc: any, booking: any) => {
                    const resourceName = booking.resources.name;
                    acc[resourceName] = (acc[resourceName] || 0) + 1;
                    return acc;
                }, {});
        
                const chartData = Object.keys(bookingCounts).map(name => ({
                    name,
                    value: bookingCounts[name]
                }));
                setAnalyticsData(chartData);
            }

            // Process all resources for quick book
            if(allResourcesData.data) {
                setAllResources(allResourcesData.data);
                setResourceTypes(Array.from(new Set(allResourcesData.data.map((r: Resource) => r.type))));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load dashboard data."
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (selectedResourceType) {
            setFilteredResources(allResources.filter(r => r.type === selectedResourceType));
        } else {
            setFilteredResources([]);
        }
        setSelectedDate(undefined);
        setSelectedStartTime('');
        setSelectedEndTime('');
    }, [selectedResourceType, allResources]);
    
    useEffect(() => {
        if (!selectedResourceId) {
            setSelectedDate(undefined);
            setSelectedStartTime('');
            setSelectedEndTime('');
            setBookingsForResource([]);
            return;
        }
        const fetchBookings = async () => {
            const { data } = await supabase
                .from('bookings')
                .select('id, start_time, end_time, status')
                .eq('resource_id', selectedResourceId)
                .eq('status', 'confirmed');
            setBookingsForResource(data || []);
        };
        fetchBookings();
    }, [selectedResourceId]);
    
    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimes([]);
            setSelectedStartTime('');
            setSelectedEndTime('');
            return;
        }
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const bookedTimes = bookingsForResource
            .filter(b => format(new Date(b.start_time), 'yyyy-MM-dd') === dateStr)
            .map(b => format(new Date(b.start_time), 'HH:mm'));
        const times = TIME_SLOTS.filter(t => !bookedTimes.includes(t));
        setAvailableTimes(times);
        setSelectedStartTime('');
        setSelectedEndTime('');
    }, [selectedDate, bookingsForResource]);

    useEffect(() => {
        if (!selectedStartTime) {
          setAvailableEndTimes([]);
          setSelectedEndTime('');
          setQuickBookEmailSent(false);
          return;
        }
    
        const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
        const possibleEndTimes: string[] = [];
    
        for (let i = startIndex + 1; i < TIME_SLOTS.length; i++) {
          const prevSlot = TIME_SLOTS[i - 1];
          if (availableTimes.includes(prevSlot)) {
            possibleEndTimes.push(TIME_SLOTS[i]);
          } else {
            break; // Stop if there is a gap in availability
          }
        }
        // Add the last possible time slot if the sequence reaches the end
        const lastSlot = TIME_SLOTS[TIME_SLOTS.length -1];
        if (availableTimes.includes(lastSlot) && possibleEndTimes.length > 0 && !possibleEndTimes.includes(lastSlot) ) {
            const lastTime = new Date(`1970-01-01T${lastSlot}:00`);
            lastTime.setHours(lastTime.getHours() + 1);
            const finalTime = format(lastTime, 'HH:mm');
            if (finalTime <= TIME_SLOTS[TIME_SLOTS.length -1])
            possibleEndTimes.push(finalTime);
        }

        setAvailableEndTimes(possibleEndTimes);
        setSelectedEndTime('');
        setQuickBookEmailSent(false);
      }, [selectedStartTime, availableTimes, bookingsForResource]);

    const handleSendQuickBookEmail = async () => {
        if (!user || !selectedDate || !selectedStartTime || !selectedEndTime) {
            toast({
                variant: "destructive",
                title: "Incomplete details",
                description: "Please select a valid date and time range."
            });
            return;
        }

        const resource = allResources.find(r => r.id === selectedResourceId);
        if (!resource) {
            toast({ variant: "destructive", title: "Resource not found" });
            return;
        }

        const startDateTime = new Date(selectedDate);
        const [startHour, startMinute] = selectedStartTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute);

        const endDateTime = new Date(selectedDate);
        const [endHour, endMinute] = selectedEndTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute);

        try {
            await sendBookingEmail({
                email: user.email!,
                userName: user.user_metadata?.full_name || user.email!,
                resourceName: resource.name,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                location: resource.location,
                bookingId: 'PENDING',
                action: 'created',
            });
            toast({
                title: "Confirmation Email Sent",
                description: "Please check your email to review your booking details.",
            });
            setQuickBookEmailSent(true);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Email Failed",
                description: "Could not send confirmation email. Please try again.",
            });
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
        if (!selectedResourceId || !selectedDate || !selectedStartTime || !selectedEndTime) {
          toast({
            variant: 'destructive',
            title: 'Missing selection',
            description: 'Please select a resource, date, start time, and end time.'
          });
          return;
        }
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const start = new Date(dateStr + 'T' + selectedStartTime + ':00');
        const end = new Date(dateStr + 'T' + selectedEndTime + ':00');

        const insert = {
            user_id: user.id,
            resource_id: selectedResourceId,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            status: 'confirmed'
        };

        const { error } = await supabase.from('bookings').insert(insert);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Booking failed',
            description: 'Failed to create booking. The selected time range may conflict with another booking.'
          });
          return;
        }
        toast({
          title: 'Booking confirmed',
          description: 'Your booking has been successfully created.'
        });
        
        // Reset state
        setShowQuickBook(false);
        setQuickBookStep(1);
        setSelectedResourceType('');
        setSelectedResourceId('');
        setSelectedDate(undefined);
        setSelectedStartTime('');
        setSelectedEndTime('');
        setBookingsForResource([]);
        fetchAllDashboardData(); // Refresh dashboard data
      };
    
    const fetchBookingStats = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('bookings')
            .select('start_time, status')
            .eq('user_id', user.id);
        
        if (error) throw error;
        
        const now = new Date();
        const upcoming = data.filter(b => b.status === 'confirmed' && isAfter(new Date(b.start_time), now)).length;
        const completed = data.filter(b => b.status === 'confirmed' && isBefore(new Date(b.start_time), now)).length;
        setStats({ upcoming, completed });
    };
    
    const fetchFavourites = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('favourites').select('resource_id').eq('user_id', user.id);
        if (error) throw error;
        setFavourites(data as Favourite[]);
    };

    const fetchUpcomingBookings = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('bookings')
            .select(`*, resources(*)`)
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3);
        if(error) throw error;
        setUpcomingBookings(data as Booking[]);
    };

    const fetchSuggestions = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('bookings')
            .select('*, resources(*)')
            .eq('user_id', user.id)
            .lt('end_time', new Date().toISOString())
            .order('end_time', { ascending: false });
            // .limit(3);
        if (error) throw error;
        
        // Group bookings by resource ID and get only the most recent one for each resource
        const bookingsByResource = new Map();
        (data || []).forEach((booking: Booking) => {
            const resourceId = booking.resources?.id;
            if (!bookingsByResource.has(resourceId)) {
                bookingsByResource.set(resourceId, booking);
            }
        });
        
        const rebookItems: SuggestionItem[] = Array.from(bookingsByResource.values()).map((booking: Booking) => ({
            type: 'rebook',
            resource: booking.resources,
            bookingDetails: booking,
        }));

        const rebookResourceIds = new Set(rebookItems.map(item => item.resource.id));
        
        const allResourceIds = await supabase.from('resources').select('id');
        if (allResourceIds.error) throw allResourceIds.error;
        const allIds = allResourceIds.data ? allResourceIds.data.map(r => r.id) : [];
        const suggestionsToFetch = allIds.filter(id => !rebookResourceIds.has(id));
        const shuffled = suggestionsToFetch.sort(() => 0.5 - Math.random());
        const randomIds = shuffled.slice(0, 3);

        let suggestionItems: SuggestionItem[] = [];
        if (randomIds.length > 0) {
            const { data: randomResourcesData } = await supabase.from('resources').select('*').in('id', randomIds);
            // Additional filter to ensure no duplicate resource IDs
            const usedResourceIds = new Set(rebookItems.map(item => item.resource.id));
            suggestionItems = (randomResourcesData || [])
                .filter((resource: Resource) => !usedResourceIds.has(resource.id))
                .map((resource: Resource) => ({
                    type: 'suggestion',
                    resource: resource,
                }));
        }

        setSuggestionList([...rebookItems, ...suggestionItems]);
    };

    const fetchAnalyticsData = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('bookings')
            .select('resources(name)')
            .eq('user_id', user.id);
        if (error) throw error;

        const bookingCounts = data.reduce((acc: any, booking: any) => {
            const resourceName = booking.resources.name;
            acc[resourceName] = (acc[resourceName] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.keys(bookingCounts).map(name => ({
            name,
            value: bookingCounts[name]
        }));
        setAnalyticsData(chartData);
    };

    if (loading) {
        return (
          <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center pt-16 bg-white">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#27548A]"></div>
            </div>
          </>
        );
    }

    const COLORS = ['#27548A', '#DDA853', '#183B4E', '#edd7bf', '#8B5A2B'];

    return (
        <>
            <Navbar />
            <div 
              className="min-h-screen pt-16" 
              style={user ? { 
                backgroundColor: "#FFFFFF",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Link to="/my-bookings">
                            <Card className="bg-[#e8ffef] border-[#27548A] hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[#183B4E]">Upcoming Bookings</CardTitle>
                                    <CalendarCheck className="h-4 w-4 text-[#27548A]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#183B4E]">{stats.upcoming}</div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/my-bookings?tab=history">
                            <Card className="bg-[#ecedff] border-[#27548A] hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[#183B4E]">Completed Bookings</CardTitle>
                                    <CalendarX className="h-4 w-4 text-[#27548A]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#183B4E]">{stats.completed}</div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/profile#favourites">
                            <Card className="bg-[#ffe3e3] border-[#27548A] hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[#183B4E]">Favourites</CardTitle>
                                    <Heart className="h-4 w-4 text-[#27548A]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#183B4E]">{favourites.length}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Quick Book Banner */}
                    <div className="relative min-h-[60vh] flex items-center justify-center border border-[#0b1623] rounded-lg p-8 mb-8 overflow-hidden bg-[#fffefe]">
  {/* Background blobs container */}
  <div className="absolute inset-0 z-0">
    <BlurryBlob
      firstBlobColor="bg-yellow-300"
      secondBlobColor="bg-blue-300"
      firstBlobClassName="top-0 left-0"
      secondBlobClassName="bottom-0 right-0"
    />
  </div>

  {/* Foreground content */}
  <div className="relative z-10 text-center">
    <h2 className="text-3xl font-bold mb-4 text-[#183B4E]">Book your resources instantly</h2>
    <AiButton onClick={() => setShowQuickBook(true)}>Quick Book</AiButton>
  </div>
</div>




                    <Dialog open={showQuickBook} onOpenChange={setShowQuickBook}>
                        <DialogContent className="sm:max-w-[420px] bg-white">
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
                                value={selectedResourceType}
                                onChange={e => {
                                    setSelectedResourceType(e.target.value);
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
                                className="max-w-xs mx-auto"
                                />
                            </div>
                            )}
                            {/* Step 4: Time */}
                            {quickBookStep === 4 && (
                                <div className="space-y-4">
                                <label className="block font-medium mb-1">Time</label>
                                <div className="flex flex-wrap gap-2">
                                  {TIME_SLOTS.map((time, index) => {
                                    const isAvailable = availableTimes.includes(time);
                                    
                                    const handleTimeClick = () => {
                                      if (!isAvailable) return;

                                      if (!selectedStartTime || (selectedStartTime && selectedEndTime)) {
                                        setSelectedStartTime(time);
                                        setSelectedEndTime('');
                                      } else {
                                        if (time > selectedStartTime) {
                                          const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
                                          const endIndex = TIME_SLOTS.indexOf(time);
                                          const isRangeValid = TIME_SLOTS.slice(startIndex, endIndex).every(slot => availableTimes.includes(slot));
                                          
                                          if (isRangeValid) {
                                            setSelectedEndTime(time);
                                          } else {
                                            toast({
                                              variant: "destructive",
                                              title: "Invalid selection",
                                              description: "Time range cannot include booked slots."
                                            });
                                          }
                                        } else {
                                          // If end time is selected before start time, treat as new start time
                                          setSelectedStartTime(time);
                                          setSelectedEndTime('');
                                        }
                                      }
                                    };

                                    const isStart = time === selectedStartTime;
                                    const isEnd = time === selectedEndTime;
                                    const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
                                    const endIndex = TIME_SLOTS.indexOf(selectedEndTime);
                                    const isInRange = selectedStartTime && selectedEndTime && index > startIndex && index < endIndex;

                                    return (
                                      <Button
                                        key={time}
                                        variant="outline"
                                        onClick={handleTimeClick}
                                        disabled={!isAvailable}
                                        className={`rounded-full ${
                                          !isAvailable
                                            ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                            : isStart || isEnd
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : isInRange
                                            ? 'bg-blue-200'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                      >
                                        {time}
                                      </Button>
                                    );
                                  })}
                                </div>
                                </div>
                            )}
                            {/* Step navigation */}
                            <div className="flex justify-between pt-4">
                                <div>
                                {quickBookStep > 1 && (
                                    <Button variant="ghost" onClick={() => setQuickBookStep(quickBookStep - 1)}>
                                        Back
                                    </Button>
                                )}
                                </div>
                                
                                <div>
                                {quickBookStep < 4 && (
                                    <Button variant="ghost" onClick={() => setQuickBookStep(quickBookStep + 1)} disabled={
                                        (quickBookStep === 1 && !selectedResourceType) ||
                                        (quickBookStep === 2 && !selectedResourceId) ||
                                        (quickBookStep === 3 && !selectedDate)
                                    }>
                                    Next
                                    </Button>
                                )}

                                {quickBookStep === 4 && !quickBookEmailSent && (
                                    <Button className="bg-[#666565] border-[#27548A] hover:bg-[#111924] text-white" onClick={handleSendQuickBookEmail} disabled={!selectedStartTime || !selectedEndTime}>
                                        Send Confirmation Email
                                    </Button>
                                )}
                                {quickBookStep === 4 && quickBookEmailSent && (
                                    <Button className="bg-[#211f3e] border-[#27548A] hover:bg-[#111924] text-white" onClick={handleQuickBook} >
                                        Confirm Booking
                                    </Button>
                                )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="lg:col-span-2 bg-white border-[#27548A]">
                            <CardHeader>
                                <CardTitle className="text-[#183B4E]">Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestionList.map(({ type, resource, bookingDetails }) => (
                                    <Link key={`${type}-${resource.id}`} to={`/calendar/${resource.id}`}>
                                        <div className="p-4 border border-[#27548A] rounded-lg hover:bg-white relative hover:shadow-lg transition-shadow duration-200">
                                            <Badge variant="secondary" className="absolute top-2 right-2 bg-[#DDA853] text-[#183B4E]">{type === 'rebook' ? 'Rebook' : 'Suggestion'}</Badge>
                                            <p className="font-semibold pr-16 text-[#183B4E]">{resource.name}</p>
                                            <p className="text-sm text-[#27548A]">{resource.location}</p>
                                            {type === 'rebook' && bookingDetails && (
                                                <p className="text-xs text-[#27548A] mt-1">
                                                    Last booked on {format(new Date(bookingDetails.start_time), 'PP')}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-[#27548A]">
                            <CardHeader>
                                <CardTitle className="text-[#183B4E]">Upcoming Bookings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingBookings.map(booking => (
                                            <div key={booking.id} className="p-3 border border-[#27548A] rounded-lg">
                                                <p className="font-semibold text-[#183B4E]">{booking.resources.name}</p>
                                                <p className="text-sm text-[#27548A]">{format(new Date(booking.start_time), 'PPp')}</p>
                                            </div>
                                        ))}
                                        <div className="text-right">
                                            <Link to="/my-bookings" className="text-sm text-blue-600 underline hover:text-blue-800">View all</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#27548A]">No upcoming bookings.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analytics */}
                    <Card className="bg-white border-[#27548A]">
                        <CardHeader>
                            <CardTitle className="text-[#183B4E]">Most booked resources by you</CardTitle>
                            {/* <CardDescription className="text-[#27548A]">Resources in demand</CardDescription> */}
                        </CardHeader>
                        <CardContent style={{ width: '100%', height: 500 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={analyticsData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label
                                    >
                                        {analyticsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
