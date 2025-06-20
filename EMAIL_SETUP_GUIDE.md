# Email Setup Guide for Booking Confirmation (Supabase Only)

This guide will help you set up real email sending for booking confirmations using only Supabase's built-in email service.

## Prerequisites

1. A Supabase project
2. Supabase project URL and service role key

## Step 1: Configure Supabase Environment Variables

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables (these should already be set):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note**: These are typically already configured in your Supabase project.

## Step 2: Configure Email Templates in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Email Templates**
3. You can customize the email templates here if needed
4. The function will use Supabase's built-in email service

## Step 3: Deploy the Email Function

### Option A: Using Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it `send-booking-confirmation`
5. Copy the code from `supabase/functions/send-booking-confirmation/index.ts`
6. Click **Deploy**

### Option B: Using Supabase CLI (if available)

```bash
# Install Supabase CLI (if not already installed)
# Windows: Download from https://github.com/supabase/cli/releases
# macOS: brew install supabase/tap/supabase
# Linux: curl -fsSL https://supabase.com/install.sh | sh

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-booking-confirmation
```

## Step 4: Test the Email Function

1. Update the `test-email.js` file with your Supabase credentials
2. Run the test:

```bash
npm run test:email
```

## Step 5: Verify Email Sending

1. Check your email inbox for the test email
2. Check the Supabase function logs for any errors
3. Verify the email content and formatting

## How It Works

The email function uses Supabase's built-in email service through the Auth API:

1. **No external dependencies**: Uses only Supabase services
2. **Built-in templates**: Leverages Supabase's email template system
3. **Automatic configuration**: Uses your existing Supabase project settings
4. **Reliable delivery**: Supabase handles email delivery and tracking

## Email Features

- **Professional design** with colors and layout
- **Action-specific content** (confirmation, cancellation, update)
- **Booking details** (resource, location, time, ID)
- **Important information** and instructions
- **Responsive design** that works on all devices

## Troubleshooting

### Common Issues

1. **"Missing Supabase configuration" error**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
   - Check that the environment variables are correct

2. **"Email service error"**
   - Check Supabase function logs for detailed error messages
   - Verify your Supabase project is active and not suspended

3. **"Function not found" error**
   - Ensure the function is deployed correctly
   - Check the function name matches exactly

4. **Emails not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check Supabase email delivery logs

### Debugging

1. Check Supabase function logs in the dashboard
2. Use the test script to verify function connectivity
3. Check Supabase Auth logs for email delivery status
4. Verify your Supabase project settings

## Advantages of Using Supabase Email Service

1. **No external dependencies**: Everything stays within Supabase ecosystem
2. **Automatic setup**: No need to configure external email providers
3. **Built-in security**: Uses Supabase's secure infrastructure
4. **Easy management**: All email settings in one place
5. **Reliable delivery**: Supabase handles email infrastructure

## Production Considerations

1. **Email limits**: Check your Supabase plan's email limits
2. **Template customization**: Customize email templates in Supabase dashboard
3. **Delivery monitoring**: Monitor email delivery through Supabase logs
4. **Rate limiting**: Consider implementing rate limiting for email sending

## Support

If you encounter issues:

1. Check the Supabase function logs
2. Verify your Supabase project status
3. Test with the provided test script
4. Check Supabase documentation for troubleshooting
5. Contact Supabase support if needed 