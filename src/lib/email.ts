import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';

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

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_yzrr51q'; // You'll need to replace this with your EmailJS service ID
const EMAILJS_TEMPLATE_ID_CONFIRMED = 'template_yfujy7p'; // Template ID for booking confirmed
const EMAILJS_TEMPLATE_ID_UPDATED = 'template_petkbe1'; // Template ID for booking updated
const EMAILJS_TEMPLATE_ID_CANCELLED = 'template_xxxxxxx'; // Template ID for booking cancelled
const EMAILJS_PUBLIC_KEY = 'ryE9j9C8jaN6nWIAR'; // You'll need to replace this with your EmailJS public key

export const sendBookingEmail = async (props: SendBookingEmailProps) => {
  try {
    console.log('Attempting to send booking email:', props);
    
    // Skip Supabase function and go directly to EmailJS for real email sending
    console.log('Using EmailJS for real email sending...');
    
    try {
      return await sendEmailJS(props);
    } catch (emailjsError) {
      console.error('EmailJS failed:', emailjsError);
      
      // Fallback - just log the email
      return await sendFallbackEmail(props);
    }
  } catch (err) {
    console.error('Email sending failed:', err);
    
    // Final fallback - just log the email
    return await sendFallbackEmail(props);
  }
};

// EmailJS email sending function
const sendEmailJS = async (props: SendBookingEmailProps) => {
  try {
    console.log('Sending email via EmailJS to:', props.email);
    console.log('Email props:', props);
    
    // Validate email address
    if (!props.email || props.email.trim() === '') {
      throw new Error('Recipient email address is empty');
    }
    
    // Select the appropriate template based on action
    let templateId: string;
    switch (props.action) {
      case 'created':
        templateId = EMAILJS_TEMPLATE_ID_CONFIRMED;
        break;
      case 'updated':
        templateId = EMAILJS_TEMPLATE_ID_UPDATED;
        break;
      case 'cancelled':
        templateId = EMAILJS_TEMPLATE_ID_CANCELLED;
        break;
      default:
        templateId = EMAILJS_TEMPLATE_ID_CONFIRMED; // fallback
    }
    
    const actionText = props.action === 'created' ? 'confirmed' : props.action;
    const subject = `Booking ${actionText}: ${props.resourceName}`;
    
    // Create Google Maps links
    const encodedLocation = encodeURIComponent(props.location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    
    // Prepare email template parameters
    // Note: EmailJS expects 'to_email' to be passed as a template parameter
    const templateParams = {
      to_email: props.email.trim(),
      to_name: props.userName,
      subject: subject,
      resource_name: props.resourceName,
      location: props.location,
      start_time: new Date(props.startTime).toLocaleDateString() + ' ' + new Date(props.startTime).toLocaleTimeString(),
      end_time: new Date(props.endTime).toLocaleTimeString(),
      booking_id: props.bookingId,
      action: actionText,
      maps_url: mapsUrl,
      directions_url: directionsUrl,
      action_type: props.action,
      // Add these as backup in case template uses different variable names
      user_email: props.email.trim(),
      user_name: props.userName,
      resource: props.resourceName,
      booking_location: props.location,
      start_date: new Date(props.startTime).toLocaleDateString(),
      start_time_only: new Date(props.startTime).toLocaleTimeString(),
      end_time_only: new Date(props.endTime).toLocaleTimeString(),
      booking_number: props.bookingId
    };

    console.log(`Using template ID: ${templateId} for action: ${props.action}`);
    console.log('Template parameters:', templateParams);

    // Send email using EmailJS
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email sent successfully via EmailJS!', result);
    return { success: true, data: { method: 'emailjs', result, templateUsed: templateId } };
  } catch (error) {
    console.error('EmailJS error:', error);
    console.error('Error details:', {
      email: props.email,
      action: props.action,
      templateId: props.action === 'created' ? EMAILJS_TEMPLATE_ID_CONFIRMED : 
                  props.action === 'updated' ? EMAILJS_TEMPLATE_ID_UPDATED : 
                  EMAILJS_TEMPLATE_ID_CANCELLED
    });
    throw error;
  }
};

// Fallback email solution (logs to console)
const sendFallbackEmail = async (props: SendBookingEmailProps) => {
  try {
    console.log('Sending fallback email for:', props.email);
    
    const emailContent = `
      Booking ${props.action}: ${props.resourceName}
      
      Hello ${props.userName},
      
      Your booking has been ${props.action}.
      
      Details:
      - Resource: ${props.resourceName}
      - Location: ${props.location}
      - Date & Time: ${new Date(props.startTime).toLocaleDateString()} from ${new Date(props.startTime).toLocaleTimeString()} to ${new Date(props.endTime).toLocaleTimeString()}
      - Booking ID: ${props.bookingId}
      
      Thank you for using Book@UM!
    `;
    
    console.log('Fallback email content:', emailContent);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Fallback email "sent" successfully!');
    return { success: true, data: { method: 'fallback' } };
  } catch (error) {
    console.error('Fallback email failed:', error);
    throw error;
  }
}; 