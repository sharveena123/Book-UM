import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trash2, Star, Mail, CheckCircle, User, Edit, Navigation } from 'lucide-react';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import FeedbackModal from '@/components/FeedbackModal';
import EditBookingModal from '@/components/EditBookingModal';
import LocationPreview from '@/components/LocationPreview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  rating: number;
  feedback: string;
  resources: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          resources (
            id,
            name,
            type,
            location
          )
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
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

  const sendCancellationEmail = async (booking: Booking) => {
    try {
      // Get user profile for full name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';

      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          email: user?.email,
          userName,
          resourceName: booking.resources.name,
          startTime: booking.start_time,
          endTime: booking.end_time,
          location: booking.resources.location,
          bookingId: booking.id,
          action: 'cancelled'
        }
      });
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleSendCancellationEmail = async () => {
    if (!cancellingBooking) return;

    setEmailLoading(true);

    try {
      await sendCancellationEmail(cancellingBooking);
      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "A cancellation confirmation email has been sent to your email address"
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "destructive",
        title: "Email failed",
        description: "Failed to send cancellation email. Please try again."
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingBooking) return;

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
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (booking.status === 'cancelled') return 'cancelled';
    if (isAfter(now, endTime)) return 'completed';
    if (isBefore(now, startTime)) return 'upcoming';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (booking: Booking) => {
    const status = getBookingStatus(booking);
    return status === 'upcoming' && isAfter(new Date(booking.start_time), addHours(new Date(), 1));
  };

  const canProvideFeedback = (booking: Booking) => {
    const status = getBookingStatus(booking);
    return status === 'completed' && !booking.rating;
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackModal(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  const canEdit = (booking: Booking) => {
    const status = getBookingStatus(booking);
    return status === 'upcoming' && isAfter(new Date(booking.start_time), addHours(new Date(), 1));
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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">View and manage your current and past bookings</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">Start by booking a resource from the dashboard</p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Browse Resources
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const status = getBookingStatus(booking);
                return (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{booking.resources.name}</CardTitle>
                          <CardDescription>{booking.resources.type}</CardDescription>
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
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <div>
                              <div>{format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}</div>
                              <div className="text-gray-600">
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
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </div>
                          )}
                          {booking.rating && (
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                              <span>{booking.rating}/5 stars</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="mb-2 text-sm font-medium">Booking QR Code</div>
                            <QRCodeSVG
                              value={`${window.location.origin}/my-bookings/${booking.id}`}
                              size={80}
                              className="mx-auto"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-col space-y-2">
                           
                     
                          </div>
                          
                          {canEdit(booking) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBooking(booking)}
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
              })}
            </div>
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
            <DialogContent className="sm:max-w-[500px]">
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

              <div className="space-y-4">
                {cancellingBooking && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{cancellingBooking.resources.name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">{cancellingBooking.resources.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(cancellingBooking.start_time), 'EEEE, MMMM d, yyyy')} from{' '}
                        {format(new Date(cancellingBooking.start_time), 'h:mm a')} to {format(new Date(cancellingBooking.end_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">{user?.email}</span>
                    </div>
                  </div>
                )}

                {emailSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        Cancellation email sent to {user?.email}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={handleCloseCancelModal}>
                    Cancel
                  </Button>
                  
                  {!emailSent ? (
                    <Button 
                      type="button" 
                      onClick={handleSendCancellationEmail}
                      disabled={emailLoading}
                    >
                      {emailLoading ? (
                        <>
                          <Mail className="h-4 w-4 mr-2 animate-pulse" />
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Cancellation Email
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={handleConfirmCancellation}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default MyBookings;
