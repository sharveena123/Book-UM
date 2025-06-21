// Direct EmailJS Test
// This tests the actual EmailJS configuration

console.log('🔍 Direct EmailJS Test');
console.log('======================\n');

// Your actual EmailJS credentials
const config = {
  serviceId: 'service_yzrr51q',
  templateIdConfirmed: 'template_yfujy7p',
  templateIdUpdated: 'template_petkbe1',
  templateIdCancelled: 'template_xxxxxxx', // Still needs to be set up
  publicKey: 'ryE9j9C8jaN6nWIAR'
};

console.log('✅ EmailJS Credentials Found:');
console.log('Service ID:', config.serviceId);
console.log('Template ID (Confirmed):', config.templateIdConfirmed);
console.log('Template ID (Updated):', config.templateIdUpdated);
console.log('Template ID (Cancelled):', config.templateIdCancelled);
console.log('Public Key:', config.publicKey);
console.log('');

// Check for missing cancelled template
if (config.templateIdCancelled.includes('xxxxxxx')) {
  console.log('⚠️  WARNING: Cancelled template not configured!');
  console.log('   - Create a cancelled template in EmailJS');
  console.log('   - Update EMAILJS_TEMPLATE_ID_CANCELLED in src/lib/email.ts');
  console.log('');
}

console.log('🎯 Next Steps to Test:');
console.log('1. Open your app at http://localhost:8081/');
console.log('2. Create a new booking');
console.log('3. Check browser console for email logs');
console.log('4. Check your EmailJS dashboard for email activity');
console.log('5. Check the recipient email inbox');
console.log('');

console.log('🔧 Troubleshooting Tips:');
console.log('- Make sure EmailJS templates have correct variables');
console.log('- Check that Gmail service is properly connected');
console.log('- Verify template variables match: {{to_email}}, {{to_name}}, etc.');
console.log('- Check browser console for any error messages');
console.log('- Look for "Using template ID:" messages in console');
console.log('');

console.log('📧 Expected Console Messages:');
console.log('- "Attempting to send booking email:"');
console.log('- "Supabase function failed, trying EmailJS..."');
console.log('- "Sending email via EmailJS to: [email]"');
console.log('- "Using template ID: [template_id] for action: [action]"');
console.log('- "✅ Email sent successfully via EmailJS!"');
console.log('');

console.log('🚨 If emails still not working:');
console.log('1. Check EmailJS dashboard for any service issues');
console.log('2. Verify Gmail connection in EmailJS');
console.log('3. Check if emails are in spam folder');
console.log('4. Test with a different email address');
console.log('5. Check EmailJS usage limits (200/month free)'); 