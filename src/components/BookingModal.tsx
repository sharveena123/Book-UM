import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Navigation } from 'lucide-react';
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
  bookingRange: { start: Date; end: Date } | null;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  resource,
  bookingRange,
  onSuccess
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!user || !bookingRange) return;

    setLoading(true);
    try {
        await sendBookingEmail({
            email: user.email!,
            userName: user.user_metadata?.full_name || user.email!,
            resourceName: resource.name,
            startTime: bookingRange.start.toISOString(),
            endTime: bookingRange.end.toISOString(),
            location: resource.location,
            bookingId: 'PENDING',
            action: 'created',
        });
        toast({
            title: "Confirmation Email Sent",
            description: "Please check your email to review your booking details.",
        });
        setEmailSent(true);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Email Failed",
            description: "Could not send confirmation email. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !bookingRange) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        resource_id: resource.id,
        start_time: bookingRange.start.toISOString(),
        end_time: bookingRange.end.toISOString(),
        notes: notes || null,
        status: 'confirmed'
      });

      if (error) {
        if (error.code === '23514') { // Check constraint violation for overlapping bookings
          toast({
            variant: "destructive",
            title: "Booking Conflict",
            description: "The selected time slot overlaps with an existing booking. Please select a different time."
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Booking Confirmed",
        description: "Your booking has been successfully created."
      });
      onSuccess();

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Failed to create booking. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingRange) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle>{emailSent ? 'Confirm Your Booking' : 'Review Booking Details'}</DialogTitle>
          <DialogDescription>
            {emailSent
              ? 'Review your booking details and confirm to book the resource.'
              : 'Please send a confirmation email before booking.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-gray-600" />
              <span className="font-semibold">{resource.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-sm text-gray-700">{resource.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-sm text-gray-700">
                {format(bookingRange.start, 'EEEE, MMM d, yyyy')}
                <br />
                {format(bookingRange.start, 'p')} - {format(bookingRange.end, 'p')}
              </span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
          </div>

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
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!emailSent ? (
            <Button className="bg-[#767676] hover:bg-[#4e4e4f] text-white" type="button" onClick={handleSendEmail} disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          ) : (
            <Button className="bg-[#211f3e] border-[#27548A] hover:bg-[#111924] text-white" type="button" onClick={handleConfirmBooking} disabled={loading}>
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
