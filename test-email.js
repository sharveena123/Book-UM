// Test Email Functionality
// Run this with: node test-email.js

console.log('📧 Email Configuration Test');
console.log('============================\n');

// Check if EmailJS credentials are configured
const emailConfig = {
  serviceId: 'service_xxxxxxx',
  templateIdConfirmed: 'template_xxxxxxx',
  templateIdUpdated: 'template_xxxxxxx',
  templateIdCancelled: 'template_xxxxxxx',
  publicKey: 'public_key_xxxxxxx'
};

console.log('Current EmailJS Configuration:');
console.log('Service ID:', emailConfig.serviceId);
console.log('Template ID (Confirmed):', emailConfig.templateIdConfirmed);
console.log('Template ID (Updated):', emailConfig.templateIdUpdated);
console.log('Template ID (Cancelled):', emailConfig.templateIdCancelled);
console.log('Public Key:', emailConfig.publicKey);
console.log('');

// Check if credentials are still placeholder values
const hasPlaceholders = Object.values(emailConfig).some(value => 
  value.includes('xxxxxxx')
);

if (hasPlaceholders) {
  console.log('❌ EmailJS credentials are not configured!');
  console.log('');
  console.log('To fix this:');
  console.log('1. Follow the EmailJS_SETUP.md guide');
  console.log('2. Sign up at https://www.emailjs.com/');
  console.log('3. Create THREE email templates:');
  console.log('   - booking-confirmed (blue theme)');
  console.log('   - booking-updated (orange theme)');
  console.log('   - booking-cancelled (red theme)');
  console.log('4. Update src/lib/email.ts with your real credentials');
  console.log('');
  console.log('Quick setup steps:');
  console.log('- Go to EmailJS dashboard');
  console.log('- Create Gmail service (get Service ID)');
  console.log('- Create 3 email templates (get Template IDs)');
  console.log('- Get your Public Key from Account > API Keys');
  console.log('- Replace the placeholder values in src/lib/email.ts');
  console.log('');
  console.log('Template Actions:');
  console.log('- EMAILJS_TEMPLATE_ID_CONFIRMED: for new bookings');
  console.log('- EMAILJS_TEMPLATE_ID_UPDATED: for booking updates');
  console.log('- EMAILJS_TEMPLATE_ID_CANCELLED: for booking cancellations');
    } else {
  console.log('✅ EmailJS credentials appear to be configured');
  console.log('Try creating, updating, or cancelling a booking to test email sending');
}

console.log('');
console.log('For immediate testing without EmailJS setup:');
console.log('- The fallback email system will log emails to console');
console.log('- Check browser console when creating/updating/cancelling bookings');
console.log('- Look for "Fallback email content:" messages');
console.log('');
console.log('Email Actions Supported:');
console.log('- created: Uses confirmed template (blue)');
console.log('- updated: Uses updated template (orange)');
console.log('- cancelled: Uses cancelled template (red)'); 