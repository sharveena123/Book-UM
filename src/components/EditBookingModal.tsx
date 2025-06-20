import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Mail, CheckCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  resources: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess
}) => {
  const [notes, setNotes] = useState(booking.notes || '');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendUpdateEmail = async () => {
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
          action: 'updated'
        }
      });
    } catch (error) {
      console.error('Error sending update email:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleSendEmail = async () => {
    if (!user) return;

    setEmailLoading(true);

    try {
      await sendUpdateEmail();
      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "An update confirmation email has been sent to your email address"
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "destructive",
        title: "Email failed",
        description: "Failed to send update email. Please try again."
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          notes: notes || null
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Booking updated",
        description: "Your booking has been successfully updated"
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update booking. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setNotes(booking.notes || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {emailSent ? 'Confirm Update' : 'Edit Booking'}
          </DialogTitle>
          <DialogDescription>
            {emailSent 
              ? 'Please confirm the update after reviewing the email sent to your address'
              : 'Update your booking details and send a confirmation email'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">{booking.resources.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">{booking.resources.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                {format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')} from{' '}
                {format(new Date(booking.start_time), 'h:mm a')} to {format(new Date(booking.end_time), 'h:mm a')}
              </span>
            </div>
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
                  Update email sent to {user?.email}
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
                    Send Update Email
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleConfirmUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal; 