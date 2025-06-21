# EmailJS Setup Guide

This guide will help you set up EmailJS to send real booking confirmation emails to users' Gmail accounts.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" as your email service
4. Connect your Gmail account (this will be the "from" email address)
5. Note down the **Service ID** (it will look like `service_xxxxxxx`)

## Step 3: Create Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:**
```
Booking {{action}}: {{resource_name}}
```

**Email Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
        .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Book@UM</h1>
            <h2>Booking {{action}}</h2>
        </div>
        
        <div class="content">
            <p>Hello {{to_name}},</p>
            
            <p>Your booking has been <strong>{{action}}</strong> successfully.</p>
            
            <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Resource:</strong> {{resource_name}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Date & Time:</strong> {{start_time}} - {{end_time}}</p>
                <p><strong>Booking ID:</strong> {{booking_id}}</p>
            </div>
            
            <p>Need directions to your booking location?</p>
            <a href="{{maps_url}}" class="button">View on Google Maps</a>
            <a href="{{directions_url}}" class="button">Get Directions</a>
            
            <div class="footer">
                <p>Thank you for using Book@UM!</p>
                <p>If you have any questions, please contact support.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

4. Save the template and note down the **Template ID** (it will look like `template_xxxxxxx`)

## Step 4: Get Your Public Key

1. Go to "Account" → "API Keys" in your EmailJS dashboard
2. Copy your **Public Key** (it will look like `public_key_xxxxxxx`)

## Step 5: Update Your Code

1. Open `src/lib/email.ts`
2. Replace the placeholder values with your actual EmailJS credentials:

```typescript
const EMAILJS_SERVICE_ID = 'service_xxxxxxx'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx'; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = 'public_key_xxxxxxx'; // Replace with your Public Key
```

## Step 6: Test the Email Functionality

1. Start your development server: `npm run dev`
2. Create a test booking
3. Check the browser console for email sending logs
4. Check your Gmail inbox for the confirmation email

## Troubleshooting

### Email Not Sending
- Verify all EmailJS credentials are correct
- Check browser console for error messages
- Ensure your Gmail account is properly connected in EmailJS
- Check EmailJS dashboard for any service issues

### Template Variables Not Working
- Make sure all template variables match exactly: `{{to_name}}`, `{{resource_name}}`, etc.
- Check that the variables are being passed correctly in the `templateParams` object

### Gmail Connection Issues
- Reconnect your Gmail account in EmailJS dashboard
- Ensure 2-factor authentication is properly configured
- Check if Gmail has blocked the connection (check Gmail security settings)

## EmailJS Free Plan Limits

- 200 emails per month
- 2 email templates
- 1 email service

For production use, consider upgrading to a paid plan for higher limits and better support.

## Security Notes

- Never commit your EmailJS credentials to version control
- Consider using environment variables for production
- The public key is safe to expose in client-side code
- Service ID and Template ID are also safe to expose

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:
```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=public_key_xxxxxxx
```

2. Update `src/lib/email.ts`:
```typescript
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
```

3. Add `.env` to your `.gitignore` file

This setup will enable real email sending to users' Gmail accounts when they create, update, or cancel bookings! 