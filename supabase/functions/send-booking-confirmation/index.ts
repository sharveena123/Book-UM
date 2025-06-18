
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const actionText = action === 'created' ? 'confirmed' : action;
    const subject = `Booking ${actionText}: ${resourceName}`;

    const emailResponse = await resend.emails.send({
      from: "BookingHub <bookings@resend.dev>",
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Booking ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h1>
          <p>Hello ${userName},</p>
          <p>Your booking has been <strong>${actionText}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Resource:</strong> ${resourceName}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleDateString()} from ${new Date(startTime).toLocaleTimeString()} to ${new Date(endTime).toLocaleTimeString()}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
          </div>

          ${action !== 'cancelled' ? `
          <p>Please arrive on time and bring a valid ID for verification.</p>
          <p>If you need to cancel or modify your booking, please do so at least 1 hour in advance.</p>
          ` : `
          <p>Your booking has been successfully cancelled. You can make a new booking anytime on our platform.</p>
          `}

          <p>Thank you for using BookingHub!</p>
          <p>Best regards,<br>The BookingHub Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
