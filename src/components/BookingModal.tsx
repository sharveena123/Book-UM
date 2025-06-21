import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Navigation, CheckCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { sendBookingEmail } from '@/lib/email';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  tags: string[];
  capacity: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  timeSlots: { start: Date; end: Date }[];
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  resource,
  timeSlots,
  onSuccess
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const openInGoogleMaps = (location: string, resourceName: string) => {
    try {
      const encodedLocation = encodeURIComponent(location);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(mapsUrl, '_blank');
      
      toast({
        title: "Opening Maps",
        description: `Opening ${resourceName} location in Google Maps`
      });
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open Google Maps"
      });
    }
  };

  const openInGoogleMapsDirections = (location: string, resourceName: string) => {
    try {
      const encodedLocation = encodeURIComponent(location);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
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

  const handleSendEmail = async () => {
    if (!user) return;

    setEmailLoading(true);

    try {
      await sendBookingEmail({
        email: user.email!,
        userName: user.user_metadata?.full_name || user.email!,
        resourceName: resource.name,
        startTime: timeSlots[0].start.toISOString(),
        endTime: timeSlots[0].end.toISOString(),
        location: resource.location,
        bookingId: 'pending', // Will be updated after booking is created
        action: 'created',
      });

      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "A confirmation email has been sent to your email address"
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "destructive",
        title: "Email failed",
        description: "Failed to send confirmation email. Please try again."
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Create bookings for all slots
      const inserts = timeSlots.map(slot => ({
        user_id: user.id,
        resource_id: resource.id,
        start_time: slot.start.toISOString(),
        end_time: slot.end.toISOString(),
        notes: notes || null,
        status: 'confirmed'
      }));

      const { data: newBookings, error } = await supabase.from('bookings').insert(inserts).select();
      
      if (error) {
          // Check for conflicts
          if (error.code === '23505') { // unique constraint violation
            toast({
              variant: "destructive",
              title: "Booking conflict",
              description: `One or more selected slots are no longer available.`
            });
          } else {
            throw error;
          }
          setLoading(false);
          return;
      }

      toast({
        title: "Booking confirmed",
        description: "Your booking(s) have been successfully created"
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Failed to create booking. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {emailSent ? 'Confirm Booking' : 'Review Booking Details'}
          </DialogTitle>
          <DialogDescription>
            {emailSent 
              ? 'Please confirm your booking after reviewing the email sent to your address'
              : 'Review your booking details and send a confirmation email'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-sm">{resource.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-xs text-gray-600">{resource.location}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInGoogleMaps(resource.location, resource.name)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInGoogleMapsDirections(resource.location, resource.name)}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Directions
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-xs text-gray-600">
                {timeSlots.length === 1
                  ? `${format(timeSlots[0].start, 'EEEE, MMMM d, yyyy')} from ${format(timeSlots[0].start, 'h:mm a')} to ${format(timeSlots[0].end, 'h:mm a')}`
                  : `${timeSlots.length} slots selected:`}
              </span>
            </div>
            {timeSlots.length > 1 && (
              <ul className="ml-6 list-disc text-xs text-gray-700">
                {timeSlots.map((slot, idx) => (
                  <li key={idx}>
                    {format(slot.start, 'EEEE, MMMM d, yyyy')} from {format(slot.start, 'h:mm a')} to {format(slot.end, 'h:mm a')}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-xs text-gray-600">{user?.email}</span>
            </div>
          </div>

          {!emailSent && (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add any special requirements or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          )}

          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs text-green-800">
                  Confirmation email sent to {user?.email}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              {emailSent ? 'Back' : 'Cancel'}
            </Button>
            
            {!emailSent ? (
              <Button 
                type="button" 
                onClick={handleSendEmail}
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
                type="button" 
                onClick={handleConfirmBooking}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Creating...' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
