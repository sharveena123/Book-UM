import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Mail, CheckCircle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
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

  const sendBookingEmail = async (action: 'created' | 'cancelled' | 'updated', slot: { start: Date; end: Date }) => {
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
          resourceName: resource.name,
          startTime: slot.start.toISOString(),
          endTime: slot.end.toISOString(),
          location: resource.location,
          bookingId: 'pending', // Will be updated after booking is created
          action
        }
      });
    } catch (error) {
      console.error('Error sending booking email:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleSendEmail = async () => {
    if (!user) return;

    setEmailLoading(true);

    try {
      await sendBookingEmail('created', timeSlots[0]);
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
      // Check for conflicts for all slots
      for (const slot of timeSlots) {
        const { data: conflicts, error: conflictError } = await supabase
          .from('bookings')
          .select('id')
          .eq('resource_id', resource.id)
          .eq('status', 'confirmed')
          .or(`and(start_time.lte.${slot.end.toISOString()},end_time.gt.${slot.start.toISOString()})`);
        if (conflictError) throw conflictError;
        if (conflicts && conflicts.length > 0) {
          toast({
            variant: "destructive",
            title: "Booking conflict",
            description: `One or more selected slots are no longer available.`
          });
          setLoading(false);
          return;
        }
      }
      // Create bookings for all slots
      const inserts = timeSlots.map(slot => ({
        user_id: user.id,
        resource_id: resource.id,
        start_time: slot.start.toISOString(),
        end_time: slot.end.toISOString(),
        notes: notes || null,
        status: 'confirmed'
      }));
      const { error } = await supabase.from('bookings').insert(inserts);
      if (error) throw error;

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
      <DialogContent className="sm:max-w-[500px] bg-white">
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
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">{resource.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">{resource.location}</span>
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
              <span className="text-sm text-gray-600">
                {timeSlots.length === 1
                  ? `${format(timeSlots[0].start, 'EEEE, MMMM d, yyyy')} from ${format(timeSlots[0].start, 'h:mm a')} to ${format(timeSlots[0].end, 'h:mm a')}`
                  : `${timeSlots.length} slots selected:`}
              </span>
            </div>
            {timeSlots.length > 1 && (
              <ul className="ml-6 list-disc text-sm text-gray-700">
                {timeSlots.map((slot, idx) => (
                  <li key={idx}>
                    {format(slot.start, 'EEEE, MMMM d, yyyy')} from {format(slot.start, 'h:mm a')} to {format(slot.end, 'h:mm a')}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">{user?.email}</span>
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
                rows={3}
              />
            </div>
          )}

          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Confirmation email sent to {user?.email}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {!emailSent ? (
              <Button 
                type="button" 
                onClick={handleSendEmail}
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
                    Send Confirmation Email
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleConfirmBooking}
                disabled={loading}
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
