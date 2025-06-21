import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Clock, MapPin, User, AlertTriangle, Mail, CheckCircle } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { sendBookingEmail } from '@/lib/email';

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

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess
}) => {
  const [notes, setNotes] = useState(booking.notes || '');
  const [selectedStartTime, setSelectedStartTime] = useState(format(new Date(booking.start_time), 'HH:mm'));
  const [selectedEndTime, setSelectedEndTime] = useState(format(new Date(booking.end_time), 'HH:mm'));
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if booking is within 24 hours
  const bookingStartTime = new Date(booking.start_time);
  const now = new Date();
  const hoursUntilBooking = differenceInHours(bookingStartTime, now);
  const canEdit = hoursUntilBooking >= 24;

  // Keep the original date fixed
  const originalDate = format(new Date(booking.start_time), 'yyyy-MM-dd');

  useEffect(() => {
    if (isOpen && booking) {
      setSelectedStartTime(format(new Date(booking.start_time), 'HH:mm'));
      setSelectedEndTime(format(new Date(booking.end_time), 'HH:mm'));
      setNotes(booking.notes || '');
      setEmailSent(false);
      fetchExistingBookings();
    }
  }, [isOpen, booking]);

  useEffect(() => {
    calculateAvailableTimes();
  }, [existingBookings]);

  const fetchExistingBookings = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status')
        .eq('resource_id', booking.resources.id)
        .eq('status', 'confirmed')
        .neq('id', booking.id) // Exclude current booking
        .gte('start_time', new Date().toISOString());

      if (error) {
        console.error('Error fetching existing bookings:', error);
        return;
      }

      setExistingBookings(bookings || []);
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
    }
  };

  const calculateAvailableTimes = () => {
    const dateStr = originalDate;
    console.log('Calculating available times for date:', dateStr);
    
    const bookedTimes = existingBookings
      .filter(b => format(new Date(b.start_time), 'yyyy-MM-dd') === dateStr)
      .flatMap(b => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        const times = [];
        let current = new Date(start);
        while (current < end) {
          times.push(format(current, 'HH:mm'));
          current.setHours(current.getHours() + 1);
        }
        return times;
      });

    console.log('Booked times for this date:', bookedTimes);
    const available = TIME_SLOTS.filter(time => !bookedTimes.includes(time));
    console.log('Available times:', available);
    setAvailableTimes(available);
  };

  const handleTimeClick = (time: string) => {
    if (!availableTimes.includes(time) || !canEdit) return;

    if (!selectedStartTime || (selectedStartTime && selectedEndTime)) {
      setSelectedStartTime(time);
      setSelectedEndTime('');
      setEmailSent(false);
    } else {
      if (time > selectedStartTime) {
        const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
        const endIndex = TIME_SLOTS.indexOf(time);
        const isRangeValid = TIME_SLOTS.slice(startIndex, endIndex).every(slot => availableTimes.includes(slot));
        
        if (isRangeValid) {
          setSelectedEndTime(time);
          setEmailSent(false);
        } else {
          toast({
            variant: "destructive",
            title: "Invalid selection",
            description: "Time range cannot include booked slots."
          });
        }
      } else {
        setSelectedStartTime(time);
        setSelectedEndTime('');
        setEmailSent(false);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!user || !selectedStartTime || !selectedEndTime) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both start and end times."
      });
      return;
    }

    setEmailLoading(true);
    try {
      const newStartTime = new Date(`${originalDate}T${selectedStartTime}:00`);
      const newEndTime = new Date(`${originalDate}T${selectedEndTime}:00`);

      await sendBookingEmail({
        email: user.email!,
        userName: user.user_metadata?.full_name || user.email!,
        resourceName: booking.resources.name,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        location: booking.resources.location,
        bookingId: booking.id,
        action: 'updated',
      });

      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Update confirmation email has been sent to your email address."
      });
    } catch (error) {
      console.error('Email error:', error);
      toast({
        variant: "destructive",
        title: "Email Failed",
        description: "Failed to send confirmation email. Please try again."
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!user) return;

    if (!canEdit) {
      toast({
        variant: "destructive",
        title: "Cannot Edit",
        description: "Bookings can only be edited at least 24 hours before the start time."
      });
      return;
    }

    if (!selectedStartTime || !selectedEndTime) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both start and end times."
      });
      return;
    }

    setLoading(true);

    try {
      const newStartTime = new Date(`${originalDate}T${selectedStartTime}:00`);
      const newEndTime = new Date(`${originalDate}T${selectedEndTime}:00`);

      const { error } = await supabase
        .from('bookings')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
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
    setSelectedStartTime(format(new Date(booking.start_time), 'HH:mm'));
    setSelectedEndTime(format(new Date(booking.end_time), 'HH:mm'));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {emailSent ? 'Confirm Update' : 'Edit Booking Time'}
          </DialogTitle>
          <DialogDescription>
            {emailSent 
              ? 'Please confirm the time update after reviewing the email sent to your address'
              : 'Update your booking time and send a confirmation email'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resource Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-sm">{booking.resources.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-xs text-gray-600">{booking.resources.location}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-xs text-gray-600">{user?.email}</span>
            </div>
          </div>

          {/* 24-hour warning */}
          {!canEdit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-xs text-red-800">
                  This booking cannot be edited as it starts within 24 hours. 
                  Bookings can only be edited at least 24 hours before the start time.
                </span>
              </div>
            </div>
          )}

          {!emailSent && (
            <>
              {/* Time Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <div className="text-xs text-gray-500 mb-2">
                  Available slots: {availableTimes.length} of {TIME_SLOTS.length}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {TIME_SLOTS.map((time, index) => {
                    const isAvailable = availableTimes.includes(time);
                    
                    const isStart = time === selectedStartTime;
                    const isEnd = time === selectedEndTime;
                    const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
                    const endIndex = TIME_SLOTS.indexOf(selectedEndTime);
                    const isInRange = selectedStartTime && selectedEndTime && index > startIndex && index < endIndex;

                    return (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTimeClick(time)}
                        disabled={!isAvailable || !canEdit}
                        className={`rounded-full text-xs h-8 ${
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
                {selectedStartTime && selectedEndTime && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {selectedStartTime} - {selectedEndTime}
                  </p>
                )}
              </div>

              {/* Notes */}
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
            </>
          )}

          {/* Email Status */}
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs text-green-800">
                  Update email sent to {user?.email}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              {emailSent ? 'Back' : 'Cancel'}
            </Button>
            
            {!emailSent ? (
              <Button 
                onClick={handleSendEmail}
                disabled={emailLoading || !canEdit || !selectedStartTime || !selectedEndTime}
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
                onClick={handleConfirmUpdate}
                disabled={loading}
                size="sm"
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