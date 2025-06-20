// Setup script for Supabase email configuration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Supabase Email Setup Helper');
console.log('===============================');
console.log('');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  const envContent = `# Supabase Configuration
# Replace these with your actual values from your Supabase dashboard

VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# These are used by the email function (already set in Supabase)
# SUPABASE_URL=your_supabase_project_url_here
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('✅ .env file already exists');
}

console.log('');
console.log('📋 Next Steps:');
console.log('==============');
console.log('');
console.log('1. 📊 Get your Supabase credentials:');
console.log('   - Go to your Supabase dashboard');
console.log('   - Navigate to Settings → API');
console.log('   - Copy your Project URL and anon/public key');
console.log('');
console.log('2. 🔧 Update your .env file:');
console.log('   - Replace the placeholder values with your actual Supabase credentials');
console.log('');
console.log('3. 📧 Deploy the email function:');
console.log('   - Go to Supabase dashboard → Edge Functions');
console.log('   - Create new function: send-booking-confirmation');
console.log('   - Copy code from supabase/functions/send-booking-confirmation/index.ts');
console.log('   - Deploy the function');
console.log('');
console.log('4. 🧪 Test the email function:');
console.log('   - Update test-email.js with your credentials');
console.log('   - Run: npm run test:email');
console.log('');
console.log('5. ✅ Verify everything works:');
console.log('   - Check your email inbox');
console.log('   - Check Supabase function logs');
console.log('');
console.log('📚 For detailed instructions, see: EMAIL_SETUP_GUIDE.md');
console.log('');
console.log('🎉 Your booking system will then send real emails for:');
console.log('   - Booking confirmations');
console.log('   - Booking cancellations');
console.log('   - Booking updates');
console.log(''); 