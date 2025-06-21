import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trash2, Star, Mail, CheckCircle, User, Edit } from 'lucide-react';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import FeedbackModal from '@/components/FeedbackModal';
import EditBookingModal from '@/components/EditBookingModal';
import LocationPreview from '@/components/LocationPreview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendBookingEmail } from '@/lib/email';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  rating: number | null;
  feedback: string | null;
  resources: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
}

const MyBookings: React.FC = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select(`*, resources(id, name, type, location)`)
        .eq('user_id', user!.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (upcomingError) throw upcomingError;
      setUpcomingBookings(upcomingData || []);

      const { data: pastData, error: pastError } = await supabase
        .from('bookings')
        .select(`*, resources(id, name, type, location)`)
        .eq('user_id', user!.id)
        .lt('start_time', new Date().toISOString())
        .order('start_time', { ascending: false });

      if (pastError) throw pastError;
      setPastBookings(pastData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your bookings"
      });
    } finally {
      setLoading(false);
    }
  };

  // const openInGoogleMaps = (location: string, resourceName: string) => {
  //   try {
  //     // Encode the location for URL
  //     const encodedLocation = encodeURIComponent(location);
  //     const encodedResourceName = encodeURIComponent(resourceName);
      
  //     // Create Google Maps URL with the location
  //     const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      
  //     // Open in new tab
  //     window.open(mapsUrl, '_blank');
      
  //     toast({
  //       title: "Opening Maps",
  //       description: `Opening ${resourceName} location in Google Maps`
  //     });
  //   } catch (error) {
  //     console.error('Error opening Google Maps:', error);
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Failed to open Google Maps"
  //     });
  //   }
  // };

  const openInGoogleMapsDirections = (location: string, resourceName: string) => {
    try {
      // Encode the location for URL
      const encodedLocation = encodeURIComponent(location);
      const encodedResourceName = encodeURIComponent(resourceName);
      
      // Create Google Maps directions URL
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
      
      // Open in new tab
      window.open(directionsUrl, '_blank');
      
      toast({
        title: "Opening Directions",
        description: `Getting directions to ${resourceName}`
      });
    } catch (error) {
      console.error('Error opening Google Maps directions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open Google Maps directions"
      });
    }
  };

  const handleSendCancellationEmail = async () => {
    if (!cancellingBooking || !user) return;

    setEmailLoading(true);
    try {
      await sendBookingEmail({
        email: user.email!,
        userName: user.user_metadata?.full_name || user.email!,
        resourceName: cancellingBooking.resources.name,
        startTime: cancellingBooking.start_time,
        endTime: cancellingBooking.end_time,
        location: cancellingBooking.resources.location,
        bookingId: cancellingBooking.id,
        action: 'cancelled',
      });

      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Cancellation confirmation email has been sent to your email address."
      });
    } catch (error) {
      console.error('Email error:', error);
      toast({
        variant: "destructive",
        title: "Email Failed",
        description: "Failed to send cancellation email. Please try again."
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingBooking || !user) return;

    setCancelLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', cancellingBooking.id);

      if (error) throw error;
      
      await fetchBookings();
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled"
      });

      handleCloseCancelModal();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel booking"
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setCancellingBooking(booking);
    setEmailSent(false);
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancellingBooking(null);
    setEmailSent(false);
  };

  const getBookingStatus = (booking: Booking) => {
    const now = new Date();
    if (booking.status === 'cancelled') return 'cancelled';
    if (isAfter(now, new Date(booking.end_time))) return 'completed';
    if (isBefore(now, new Date(booking.start_time))) return 'upcoming';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-[#27548A] text-white';
      case 'active': return 'bg-[#DDA853] text-[#183B4E]';
      case 'completed': return 'bg-white text-[#183B4E] border border-[#27548A]';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-white text-[#183B4E] border border-[#27548A]';
    }
  };

  const canCancel = (booking: Booking) => {
    return getBookingStatus(booking) === 'upcoming' && isAfter(new Date(booking.start_time), addHours(new Date(), 1));
  };

  const canProvideFeedback = (booking: Booking) => {
    return getBookingStatus(booking) === 'completed' && !booking.rating;
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackModal(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  const canEdit = (booking: Booking) => {
    return getBookingStatus(booking) === 'upcoming' && isAfter(new Date(booking.start_time), addHours(new Date(), 1));
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedBooking(null);
    fetchBookings();
  };
  
  const renderBookingCard = (booking: Booking) => {
    const status = getBookingStatus(booking);
    return (
      <Card key={booking.id} className="bg-white border-[#27548A]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-[#183B4E]">{booking.resources.name}</CardTitle>
              <CardDescription className="text-[#27548A]">{booking.resources.type}</CardDescription>
            </div>
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-[#27548A]" />
                <div>
                  <div className="text-[#183B4E]">{format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-[#27548A]">
                    {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                  </div>
                </div>
              </div>
              
              <LocationPreview
                location={booking.resources.location}
                resourceName={booking.resources.name}
                onGetDirections={() => openInGoogleMapsDirections(booking.resources.location, booking.resources.name)}
              />
              
              {booking.notes && (
                <div className="text-sm">
                  <span className="font-medium text-[#183B4E]">Notes:</span> <span className="text-[#27548A]">{booking.notes}</span>
                </div>
              )}
              {booking.rating && (
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-1 text-[#DDA853] fill-current" />
                  <span className="text-[#183B4E]">{booking.rating}/5 stars</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-sm font-medium text-[#183B4E]">Booking QR Code</div>
                <QRCodeSVG
                  value={`${window.location.origin}/my-bookings/${booking.id}`}
                  size={80}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {canEdit(booking) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBooking(booking)}
                  className="border-[#27548A] text-[#27548A] hover:bg-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>
              )}
              {canCancel(booking) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelBooking(booking)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
              {canProvideFeedback(booking) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowFeedbackModal(true);
                  }}
                  className="border-[#DDA853] text-[#DDA853] hover:bg-white"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate & Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#183B4E] mb-2">My Bookings</h1>
            <p className="text-[#27548A]">View and manage your current and past bookings</p>
          </div>

          {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-[#27548A] mb-4" />
              <h3 className="text-lg font-medium text-[#183B4E] mb-2">No bookings yet</h3>
              <p className="text-[#27548A] mb-4">Start by booking a resource from the dashboard</p>
              <Button onClick={() => window.location.href = '/dashboard'} className="bg-[#27548A] hover:bg-[#183B4E] text-white">
                Browse Resources
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white border border-[#27548A]">
                <TabsTrigger value="upcoming" className="text-[#183B4E] data-[state=active]:bg-[#27548A] data-[state=active]:text-white">Upcoming</TabsTrigger>
                <TabsTrigger value="history" className="text-[#183B4E] data-[state=active]:bg-[#27548A] data-[state=active]:text-white">History</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-6 mt-6">
                    {upcomingBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-[#27548A] mb-4" />
                    <h3 className="text-lg font-medium text-[#183B4E] mb-2">No upcoming bookings</h3>
                    <p className="text-[#27548A] mb-4">Your future reservations will appear here.</p>
                    <Button onClick={() => window.location.href = '/dashboard'} className="bg-[#27548A] hover:bg-[#183B4E] text-white">
                      Book a Resource
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history">
                {pastBookings.length > 0 ? (
                  <div className="space-y-6 mt-6">
                    {pastBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-[#27548A] mb-4" />
                    <h3 className="text-lg font-medium text-[#183B4E] mb-2">No booking history</h3>
                    <p className="text-[#27548A]">Your completed and cancelled bookings will appear here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {showFeedbackModal && selectedBooking && (
            <FeedbackModal
              isOpen={showFeedbackModal}
              onClose={() => setShowFeedbackModal(false)}
              booking={selectedBooking}
              onSuccess={handleFeedbackSuccess}
            />
          )}

          {showEditModal && selectedBooking && (
            <EditBookingModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              booking={selectedBooking}
              onSuccess={handleEditSuccess}
            />
          )}

          {/* Cancellation Confirmation Modal */}
          <Dialog open={showCancelModal} onOpenChange={handleCloseCancelModal}>
            <DialogContent className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>
                  {emailSent ? 'Confirm Cancellation' : 'Cancel Booking'}
                </DialogTitle>
                <DialogDescription>
                  {emailSent 
                    ? 'Please confirm the cancellation after reviewing the email sent to your address'
                    : 'Send a cancellation confirmation email before cancelling your booking'
                  }
                </DialogDescription>
              </DialogHeader>

              {cancellingBooking && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium text-sm">{cancellingBooking.resources.name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-xs text-gray-600">{cancellingBooking.resources.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {format(new Date(cancellingBooking.start_time), 'EEEE, MMMM d, yyyy')} from{' '}
                        {format(new Date(cancellingBooking.start_time), 'h:mm a')} to {format(new Date(cancellingBooking.end_time), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  {emailSent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-xs text-green-800">
                          Cancellation email sent to {user?.email}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCloseCancelModal} disabled={cancelLoading}>
                      {emailSent ? 'Back' : 'Cancel'}
                    </Button>
                    
                    {!emailSent ? (
                      <Button 
                        onClick={handleSendCancellationEmail}
                        disabled={emailLoading}
                        size="sm"
                      >
                        {emailLoading ? (
                          <>
                            <Mail className="h-4 w-4 mr-2 animate-pulse" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive"
                        onClick={handleConfirmCancellation}
                        disabled={cancelLoading}
                        size="sm"
                      >
                        {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default MyBookings;
