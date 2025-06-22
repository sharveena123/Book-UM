import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface BookieChatbotProps {
  geminiApiKey?: string;
}

const BookieChatbot: React.FC<BookieChatbotProps> = ({ geminiApiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Bookie, your AI assistant for booking resources. I can help you find resources, make bookings, check availability, and answer any questions about the booking system. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: "Could not recognize speech. Please try again."
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const speak = (text: string) => {
    if (speechSynthesis && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
      toast({
        title: "Listening...",
        description: "Speak now to send a voice message"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Voice Not Supported",
        description: "Voice recognition is not available in your browser"
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call Gemini API
      const response = await callGeminiAPI(text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      speak(response);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to AI service"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (userInput: string): Promise<string> => {
    // For now, we'll use a mock response since we don't have the actual Gemini API key
    // In production, you would replace this with actual Gemini API call
    
    const mockResponses = [
      "I can help you book resources! What type of resource are you looking for?",
      "To make a booking, go to the dashboard and select a resource. Then choose your preferred time slot.",
      "You can view all your bookings in the 'My Bookings' section. There you can also cancel or edit existing bookings.",
      "The booking system supports study pods, meeting rooms, lab equipment, and more. What do you need?",
      "If you need to cancel a booking, you can do so up to 1 hour before the scheduled time.",
      "Each booking includes location details and Google Maps integration for easy navigation.",
      "You'll receive email confirmations for all booking actions including creation, updates, and cancellations.",
      "The system automatically checks for booking conflicts to ensure availability.",
      "You can add notes to your bookings for special requirements or instructions.",
      "Need help finding a specific resource? I can guide you through the booking process!"
    ];

    // Simple keyword-based responses
    const input = userInput.toLowerCase();
    
    if (input.includes('book') || input.includes('reserve') || input.includes('schedule')) {
      return "To make a booking, go to the dashboard and select a resource. Then choose your preferred time slot and confirm your booking. You'll receive an email confirmation once it's done!";
    }
    
    if (input.includes('cancel') || input.includes('delete')) {
      return "To cancel a booking, go to 'My Bookings' and click the 'Cancel Booking' button. You can cancel up to 1 hour before the scheduled time. You'll receive an email confirmation of the cancellation.";
    }
    
    if (input.includes('edit') || input.includes('modify') || input.includes('change')) {
      return "You can edit your booking notes in the 'My Bookings' section. Click 'Edit Booking' to modify your notes. For time changes, you'll need to cancel and rebook.";
    }
    
    if (input.includes('location') || input.includes('where') || input.includes('map')) {
      return "Each booking shows the resource location. You can click 'Get Directions' to open Google Maps with directions to the location. The location is also included in your confirmation emails.";
    }
    
    if (input.includes('email') || input.includes('confirmation')) {
      return "You'll receive email confirmations for all booking actions - when you create, edit, or cancel a booking. The emails include all booking details and location information.";
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! I can assist with booking resources, checking availability, managing your bookings, and answering questions about the system. What would you like to know?";
    }
    
    if (input.includes('resource') || input.includes('available') || input.includes('what')) {
      return "The system offers various resources including study pods, meeting rooms, lab equipment, and collaborative spaces. Each resource has different capacities and features. Check the dashboard to see what's available!";
    }
    
    // Return a random helpful response
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <DialogTitle>Bookie - AI Assistant</DialogTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  {/* <X className="h-4 w-4" /> */}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                      )}
                      {message.sender === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-white" />
                      )}
                      <div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Bookie is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or use voice..."
                  className="pr-20"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {isListening && (
              <p className="text-xs text-blue-600 mt-2 text-center">
                🎤 Listening... Speak now
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookieChatbot; 