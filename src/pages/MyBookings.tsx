
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trash2, Star } from 'lucide-react';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import FeedbackModal from '@/components/FeedbackModal';

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

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled"
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel booking"
      });
    }
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
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {booking.resources.location}
                          </div>
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
                          {canCancel(booking) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
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
        </div>
      </div>
    </>
  );
};

export default MyBookings;
