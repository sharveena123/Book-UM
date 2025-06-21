import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  email: string;
  userName: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  location: string;
  bookingId: string;
  action: 'created' | 'cancelled' | 'updated';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, resourceName, startTime, endTime, location, bookingId, action }: BookingEmailRequest = await req.json();

    // Validate required fields
    if (!email || !userName || !resourceName || !startTime || !endTime || !location || !bookingId || !action) {
      throw new Error("Missing required fields");
    }

    const actionText = action === 'created' ? 'confirmed' : action;
    const subject = `Booking ${actionText}: ${resourceName}`;

    // Create Google Maps links
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Booking ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h1>
        </div>
        <p>Hello ${userName},</p>
        <p>Your booking has been <strong>${actionText}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
          <p><strong>Resource:</strong> ${resourceName}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleDateString()} from ${new Date(startTime).toLocaleTimeString()} to ${new Date(endTime).toLocaleTimeString()}</p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        
        ${action !== 'cancelled' ? `
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0056b3;">📍 Location & Directions</h4>
          <p style="margin: 0 0 15px 0;">Need help finding the location?</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${mapsUrl}" style="background-color: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
              📍 View on Google Maps
            </a>
            <a href="${directionsUrl}" style="background-color: #34a853; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🧭 Get Directions
            </a>
          </div>
        </div>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">Important Information</h4>
          <p style="margin: 0;">Please arrive on time and bring a valid ID for verification.</p>
          <p style="margin: 10px 0 0 0;">If you need to cancel or modify your booking, please do so at least 1 hour in advance.</p>
        </div>
        ` : `
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #721c24;">Cancellation Confirmed</h4>
          <p style="margin: 0;">Your booking has been successfully cancelled. You can make a new booking anytime on our platform.</p>
        </div>
        `}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666;">Thank you for using Book@UM!</p>
          <p style="margin: 5px 0 0 0; color: #666;">Best regards,<br>The Book@UM Team</p>
        </div>
      </div>
    `;

    // For now, we'll just log the email details and return success
    // In a production environment, you would integrate with a real email service here
    console.log('Email would be sent to:', email);
    console.log('Subject:', subject);
    console.log('Email content:', emailHtml);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email processed successfully',
      data: { 
        email, 
        subject, 
        action,
        method: 'edge-function'
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in booking confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
