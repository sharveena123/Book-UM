// Test script for Bookie AI Chatbot
// Run this in the browser console to test the chatbot

console.log('🧪 Testing Bookie AI Chatbot...');

// Test 1: Check if Bookie component is loaded
function testBookieComponent() {
  console.log('📋 Test 1: Checking Bookie component...');
  
  // Check if the floating button exists
  const floatingButton = document.querySelector('button[class*="fixed bottom-6 right-6"]');
  if (floatingButton) {
    console.log('✅ Floating button found');
  } else {
    console.log('❌ Floating button not found');
  }
  
  // Check if dialog exists
  const dialog = document.querySelector('[role="dialog"]');
  if (dialog) {
    console.log('✅ Dialog component found');
  } else {
    console.log('❌ Dialog component not found');
  }
}

// Test 2: Test voice recognition support
function testVoiceRecognition() {
  console.log('🎤 Test 2: Checking voice recognition support...');
  
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    console.log('✅ Speech recognition is supported');
    console.log('   - WebkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
    console.log('   - SpeechRecognition:', 'SpeechRecognition' in window);
  } else {
    console.log('❌ Speech recognition is not supported');
  }
}

// Test 3: Test speech synthesis support
function testSpeechSynthesis() {
  console.log('🔊 Test 3: Checking speech synthesis support...');
  
  if ('speechSynthesis' in window) {
    console.log('✅ Speech synthesis is supported');
    
    // Test available voices
    const voices = window.speechSynthesis.getVoices();
    console.log(`   - Available voices: ${voices.length}`);
    
    if (voices.length > 0) {
      console.log('   - Sample voice:', voices[0].name);
    }
  } else {
    console.log('❌ Speech synthesis is not supported');
  }
}

// Test 4: Test microphone permissions
async function testMicrophonePermissions() {
  console.log('🎙️ Test 4: Checking microphone permissions...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop()); // Clean up
  } catch (error) {
    console.log('❌ Microphone access denied or not available');
    console.log('   Error:', error.message);
  }
}

// Test 5: Simulate chat interaction
function testChatInteraction() {
  console.log('💬 Test 5: Simulating chat interaction...');
  
  // Click the floating button to open chat
  const floatingButton = document.querySelector('button[class*="fixed bottom-6 right-6"]');
  if (floatingButton) {
    floatingButton.click();
    console.log('✅ Chat dialog opened');
    
    // Wait a bit for the dialog to open
    setTimeout(() => {
      // Check if input field exists
      const inputField = document.querySelector('input[placeholder*="Type your message"]');
      if (inputField) {
        console.log('✅ Input field found');
        
        // Test typing
        inputField.value = 'How do I book a resource?';
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Text input simulated');
        
        // Test sending message
        const sendButton = document.querySelector('button[type="submit"]');
        if (sendButton && !sendButton.disabled) {
          console.log('✅ Send button is enabled');
        } else {
          console.log('❌ Send button is disabled or not found');
        }
      } else {
        console.log('❌ Input field not found');
      }
    }, 500);
  } else {
    console.log('❌ Could not open chat dialog');
  }
}

// Test 6: Check responsive design
function testResponsiveDesign() {
  console.log('📱 Test 6: Checking responsive design...');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  console.log(`   - Viewport: ${viewport.width}x${viewport.height}`);
  
  // Check if floating button is visible
  const floatingButton = document.querySelector('button[class*="fixed bottom-6 right-6"]');
  if (floatingButton) {
    const rect = floatingButton.getBoundingClientRect();
    console.log(`   - Button position: ${rect.left}, ${rect.top}`);
    console.log(`   - Button size: ${rect.width}x${rect.height}`);
    
    if (rect.width > 0 && rect.height > 0) {
      console.log('✅ Floating button is visible');
    } else {
      console.log('❌ Floating button is not visible');
    }
  }
}

// Test 7: Performance check
function testPerformance() {
  console.log('⚡ Test 7: Checking performance...');
  
  const startTime = performance.now();
  
  // Simulate opening and closing chat
  const floatingButton = document.querySelector('button[class*="fixed bottom-6 right-6"]');
  if (floatingButton) {
    floatingButton.click();
    
    setTimeout(() => {
      const openTime = performance.now() - startTime;
      console.log(`   - Chat open time: ${openTime.toFixed(2)}ms`);
      
      // Close chat
      const closeButton = document.querySelector('button[class*="h-8 w-8 p-0"]');
      if (closeButton) {
        closeButton.click();
        const totalTime = performance.now() - startTime;
        console.log(`   - Total interaction time: ${totalTime.toFixed(2)}ms`);
      }
    }, 100);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Bookie chatbot tests...\n');
  
  testBookieComponent();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  testVoiceRecognition();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  testSpeechSynthesis();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await testMicrophonePermissions();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  testChatInteraction();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  testResponsiveDesign();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  testPerformance();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📝 Manual Testing Checklist:');
  console.log('1. Click the floating chat button');
  console.log('2. Try typing a message and sending it');
  console.log('3. Click the microphone button for voice input');
  console.log('4. Test the mute/unmute button');
  console.log('5. Check if responses are appropriate');
  console.log('6. Test on different screen sizes');
}

// Export for manual testing
window.testBookie = {
  runAllTests,
  testBookieComponent,
  testVoiceRecognition,
  testSpeechSynthesis,
  testMicrophonePermissions,
  testChatInteraction,
  testResponsiveDesign,
  testPerformance
};

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

console.log('📖 Bookie test script loaded. Run testBookie.runAllTests() to test manually.'); 