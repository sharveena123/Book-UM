import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPreviewProps {
  location: string;
  resourceName: string;
  onGetDirections: () => void;
}

const LocationPreview: React.FC<LocationPreviewProps> = ({
  location,
  resourceName,

  onGetDirections
}) => {
  // Create Google Maps embed URL
  const encodedLocation = encodeURIComponent(location);
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedLocation}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{resourceName}</span>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-3">{location}</p>
        
        {/* Map Preview - You can uncomment this if you have a Google Maps API key */}
        {/* 
        <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={embedUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        */}
        
        <div className="flex space-x-2">
 
          <Button
            variant="outline"
            size="sm"
            onClick={onGetDirections}
            className="flex-1"
          >
            <Navigation className="h-3 w-3 mr-1" />
            Directions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPreview; 