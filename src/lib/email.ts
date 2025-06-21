import { supabase } from '@/integrations/supabase/client';

interface SendBookingEmailProps {
  email: string;
  userName: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  location: string;
  bookingId: string;
  action: 'created' | 'cancelled' | 'updated';
}

export const sendBookingEmail = async (props: SendBookingEmailProps) => {
  try {
    console.log('Attempting to send booking email:', props);
    
    const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: props
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Email function error: ${error.message}`);
    }

    console.log('Email function response:', data);
    
    if (data && data.success) {
      console.log('✅ Email sent successfully!');
      return { success: true, data };
    } else {
      console.error('Email function returned error:', data);
      throw new Error(data?.error || 'Unknown email error');
    }
  } catch (err) {
    console.error('An unexpected error occurred while sending the email:', err);
    throw err; // Re-throw to allow calling code to handle the error
  }
}; 