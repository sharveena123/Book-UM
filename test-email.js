// Test script to verify Supabase email function
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://wwitcfzvhusatghnatry.supabase.co';
const supabaseKey = 'your-anon-key'; // You'll need to replace this with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailFunction() {
  try {
    console.log('Testing email function...');
    
    const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: {
        email: 'test@example.com',
        userName: 'Test User',
        resourceName: 'Test Resource',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: 'Test Location',
        bookingId: 'test-123',
        action: 'created'
      }
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testEmailFunction(); 