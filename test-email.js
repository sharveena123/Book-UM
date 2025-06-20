// Test script to verify Supabase email function
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmail() {
  try {
    console.log('Testing Supabase email function...');
    
    const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: {
        email: 'test@example.com', // Replace with your email
        userName: 'Test User',
        resourceName: 'Test Resource',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        location: 'Test Location',
        bookingId: 'test-123',
        action: 'created'
      }
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email function response:', data);
      if (data.success) {
        console.log('✅ Email sent successfully via Supabase!');
        console.log('Check your email inbox for the confirmation email.');
      } else {
        console.log('❌ Email sending failed:', data.error);
      }
    }
  } catch (err) {
    console.error('Function call failed:', err);
  }
}

// Instructions for setup
console.log('📧 Supabase Email Test Script');
console.log('==============================');
console.log('');
console.log('Before running this test:');
console.log('1. Update YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY above');
console.log('2. Replace test@example.com with your actual email');
console.log('3. Deploy the send-booking-confirmation function to Supabase');
console.log('4. Ensure your Supabase project has email service enabled');
console.log('');
console.log('Running test...\n');

testEmail(); 