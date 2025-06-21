// EmailJS Setup Test
// This will help identify configuration issues

console.log('🔧 EmailJS Configuration Test');
console.log('==============================\n');

// Your current configuration
const config = {
  serviceId: 'service_yzrr51q',
  templateIdConfirmed: 'template_yfujy7p',
  templateIdUpdated: 'template_petkbe1',
  templateIdCancelled: 'template_xxxxxxx',
  publicKey: 'ryE9j9C8jaN6nWIAR'
};

console.log('📋 Current Configuration:');
console.log('Service ID:', config.serviceId);
console.log('Template ID (Confirmed):', config.templateIdConfirmed);
console.log('Template ID (Updated):', config.templateIdUpdated);
console.log('Template ID (Cancelled):', config.templateIdCancelled);
console.log('Public Key:', config.publicKey);
console.log('');

// Check for common issues
console.log('🔍 Potential Issues:');
console.log('');

// Issue 1: Missing cancelled template
if (config.templateIdCancelled.includes('xxxxxxx')) {
  console.log('❌ ISSUE 1: Cancelled template not configured');
  console.log('   Solution: Create cancelled template in EmailJS');
  console.log('');
}

// Issue 2: Template variable mismatch
console.log('❓ ISSUE 2: Template variable mismatch (most likely cause)');
console.log('   Your EmailJS templates must use these exact variables:');
console.log('   - {{to_email}} - for recipient email');
console.log('   - {{to_name}} - for recipient name');
console.log('   - {{resource_name}} - for resource name');
console.log('   - {{location}} - for location');
console.log('   - {{start_time}} - for start date/time');
console.log('   - {{end_time}} - for end time');
console.log('   - {{booking_id}} - for booking ID');
console.log('   - {{action}} - for action (confirmed/updated/cancelled)');
console.log('   - {{maps_url}} - for Google Maps link');
console.log('   - {{directions_url}} - for Google Directions link');
console.log('');

// Issue 3: EmailJS template setup
console.log('❓ ISSUE 3: EmailJS template configuration');
console.log('   In your EmailJS templates, make sure:');
console.log('   - "To Email" field is set to: {{to_email}}');
console.log('   - "From Email" field is your Gmail address');
console.log('   - Template is published (not in draft mode)');
console.log('   - Gmail service is properly connected');
console.log('');

console.log('🎯 Next Steps:');
console.log('1. Go to EmailJS Dashboard → Email Templates');
console.log('2. Check each template (confirmed, updated, cancelled)');
console.log('3. Verify "To Email" field uses {{to_email}}');
console.log('4. Make sure templates are published');
console.log('5. Test with a booking in your app');
console.log('');

console.log('📧 Expected Console Output:');
console.log('When you create a booking, you should see:');
console.log('- "Attempting to send booking email: {...}"');
console.log('- "Supabase function failed, trying EmailJS..."');
console.log('- "Sending email via EmailJS to: user@example.com"');
console.log('- "Using template ID: template_yfujy7p for action: created"');
console.log('- "Template parameters: {...}"');
console.log('- "✅ Email sent successfully via EmailJS!"');
console.log('');

console.log('🚨 If you still get "422 The recipients address is empty":');
console.log('1. Check EmailJS template "To Email" field');
console.log('2. Make sure it says {{to_email}} (not to_email or user_email)');
console.log('3. Verify template is published');
console.log('4. Check EmailJS dashboard for any service errors');
console.log('');

console.log('💡 Quick Fix:');
console.log('In your EmailJS template editor:');
console.log('- Find the "To Email" field');
console.log('- Make sure it contains: {{to_email}}');
console.log('- Save and publish the template');
console.log('- Test again with a booking'); 