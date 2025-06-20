# Bookie AI Chatbot Setup Guide

## Overview

Bookie is an AI-powered chatbot assistant for the booking system that provides:
- **Voice Commands**: Users can speak to interact with the chatbot
- **Text Chat**: Traditional text-based conversation
- **Text-to-Speech**: Bookie can speak responses back to users
- **Context-Aware Responses**: Understands booking system queries
- **Floating UI**: Always accessible floating button on all pages

## Features

### 🎤 Voice Commands
- Click the microphone button to start voice recognition
- Speak naturally to ask questions or make requests
- Automatic speech-to-text conversion
- Visual feedback during listening

### 🔊 Text-to-Speech
- Bookie speaks responses back to users
- Toggle mute/unmute with the volume button
- Adjustable speech rate and pitch
- Browser-native speech synthesis

### 💬 Smart Responses
- Booking system knowledge
- Resource availability queries
- Booking management assistance
- Location and navigation help
- Email confirmation information

### 🎨 User Interface
- Floating chat button (bottom-right corner)
- Expandable chat dialog
- Message history with timestamps
- Loading indicators
- Responsive design

## Current Implementation

The chatbot currently uses **mock responses** for demonstration purposes. It includes:

### Keyword-Based Responses
- **Booking**: How to make bookings
- **Cancel**: How to cancel bookings  
- **Edit**: How to edit bookings
- **Location**: Location and map information
- **Email**: Email confirmation details
- **Help**: General assistance
- **Resources**: Available resource types

### Sample Conversations
```
User: "How do I book a resource?"
Bookie: "To make a booking, go to the dashboard and select a resource..."

User: "Where is my booking located?"
Bookie: "Each booking shows the resource location. You can click 'Get Directions'..."

User: "Can I cancel my booking?"
Bookie: "To cancel a booking, go to 'My Bookings' and click the 'Cancel Booking' button..."
```

## Integration with Gemini AI

To enable real AI responses using Google's Gemini API:

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Environment Setup
Add your Gemini API key to your environment variables:

```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Update the Chatbot
Replace the `callGeminiAPI` function in `BookieChatbot.tsx`:

```typescript
const callGeminiAPI = async (userInput: string): Promise<string> => {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Bookie, an AI assistant for a resource booking system. 
                   Help users with booking resources, checking availability, managing bookings, 
                   and answering questions about the system. Be helpful and concise.
                   
                   User question: ${userInput}`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};
```

### 4. Pass API Key to Component
Update the App.tsx to pass the API key:

```typescript
<BookieChatbot geminiApiKey={import.meta.env.VITE_GEMINI_API_KEY} />
```

## Browser Compatibility

### Speech Recognition
- ✅ Chrome/Edge (WebkitSpeechRecognition)
- ✅ Firefox (SpeechRecognition)
- ❌ Safari (Limited support)
- ❌ Mobile browsers (Varies)

### Speech Synthesis
- ✅ Most modern browsers
- ✅ Mobile browsers
- ⚠️ Safari (May require user interaction)

## Customization Options

### 1. Styling
Modify the floating button appearance:

```typescript
// In BookieChatbot.tsx
<Button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
  size="icon"
>
  <MessageCircle className="h-6 w-6" />
</Button>
```

### 2. Welcome Message
Customize the initial greeting:

```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: "Hi! I'm Bookie, your AI assistant for booking resources...",
    sender: 'bot',
    timestamp: new Date()
  }
]);
```

### 3. Voice Settings
Adjust speech synthesis parameters:

```typescript
const speak = (text: string) => {
  if (speechSynthesis && !isMuted) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;      // Speed (0.1 to 10)
    utterance.pitch = 1;       // Pitch (0 to 2)
    utterance.volume = 0.8;    // Volume (0 to 1)
    speechSynthesis.speak(utterance);
  }
};
```

### 4. Response Context
Enhance the AI context with system information:

```typescript
const systemContext = `
You are Bookie, an AI assistant for a resource booking system.
Available resources: Study pods, meeting rooms, lab equipment, collaborative spaces.
Features: Email confirmations, Google Maps integration, booking management.
Help users with: Making bookings, checking availability, managing existing bookings, 
finding locations, understanding email confirmations, and general system questions.
`;
```

## Testing the Chatbot

### 1. Voice Recognition Test
1. Click the microphone button
2. Speak clearly: "How do I book a resource?"
3. Verify the text appears in the input field
4. Check that the response is appropriate

### 2. Text-to-Speech Test
1. Send a message: "What resources are available?"
2. Verify Bookie speaks the response
3. Test the mute/unmute button
4. Check speech quality and speed

### 3. Response Quality Test
Try these test queries:
- "I need to book a meeting room"
- "How do I cancel my booking?"
- "Where is the lab equipment located?"
- "Will I get an email confirmation?"
- "What if I need to change my booking time?"

## Troubleshooting

### Voice Recognition Issues
- **Not working**: Check browser compatibility
- **Poor accuracy**: Speak clearly and reduce background noise
- **Permission denied**: Allow microphone access in browser settings

### Speech Synthesis Issues
- **Not speaking**: Check if muted, try unmuting
- **Wrong voice**: Browser may use different voice
- **No sound**: Check system volume and browser audio settings

### API Issues
- **Gemini errors**: Verify API key and quota
- **Network errors**: Check internet connection
- **Rate limiting**: Implement retry logic

## Future Enhancements

### 1. Advanced AI Features
- **Context Memory**: Remember conversation history
- **Intent Recognition**: Better understanding of user intent
- **Multi-language Support**: Support for different languages
- **Personalization**: Learn user preferences

### 2. Enhanced Voice Features
- **Voice Selection**: Choose different voices
- **Accent Support**: Support for different accents
- **Noise Cancellation**: Better voice recognition in noisy environments
- **Continuous Listening**: Always-on voice activation

### 3. Integration Features
- **Booking Actions**: Direct booking creation through chat
- **Calendar Integration**: Show availability in chat
- **Notification Integration**: Chat notifications for booking updates
- **Analytics**: Track common questions and usage patterns

### 4. UI Improvements
- **Dark Mode**: Support for dark theme
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Better screen reader support
- **Mobile Optimization**: Improved mobile experience

## Security Considerations

### 1. API Key Security
- Never expose API keys in client-side code
- Use environment variables
- Implement rate limiting
- Monitor API usage

### 2. Voice Data
- Voice data is processed locally
- No voice recordings are stored
- Respect user privacy preferences
- Clear data handling policies

### 3. User Input
- Sanitize user inputs
- Implement input validation
- Prevent injection attacks
- Log suspicious activities

## Deployment Notes

### 1. Environment Variables
Ensure these are set in production:
```bash
VITE_GEMINI_API_KEY=your_production_api_key
```

### 2. Build Optimization
The chatbot is included in the main bundle. Consider:
- Code splitting for the chatbot
- Lazy loading for voice features
- Bundle size optimization

### 3. Performance Monitoring
Monitor:
- Voice recognition accuracy
- API response times
- User engagement metrics
- Error rates

## Support

For issues or questions about Bookie:
1. Check browser compatibility
2. Verify API key configuration
3. Test voice permissions
4. Review console errors
5. Check network connectivity

The chatbot is designed to gracefully handle errors and provide helpful feedback to users when issues occur. 