# Google Maps Integration Setup

This guide explains how Google Maps integration works in your booking system and how to enhance it further.

## Current Implementation

Your booking system now includes Google Maps integration with the following features:

### 1. **My Bookings Page**
- **View on Map** button - Opens Google Maps with the resource location
- **Get Directions** button - Opens Google Maps with directions to the location
- **Location Preview** component - Shows location details with action buttons

### 2. **Booking Modal**
- **View** button - Opens Google Maps to see the location before booking
- **Directions** button - Gets directions to the location

### 3. **Email Confirmations**
- **View on Google Maps** link in confirmation emails
- **Get Directions** link in confirmation emails
- Professional styling with Google Maps branding colors

## How It Works

The integration uses Google Maps URLs that work without an API key:

### View Location
```
https://www.google.com/maps/search/?api=1&query={encoded_location}
```

### Get Directions
```
https://www.google.com/maps/dir/?api=1&destination={encoded_location}
```

## Optional Enhancements

### 1. **Google Maps API Key (Optional)**

If you want to add embedded maps or more advanced features:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Maps JavaScript API
   - Create credentials (API Key)

2. **Add to Environment Variables:**
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Enable Map Previews:**
   - Uncomment the iframe code in `LocationPreview.tsx`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key

### 2. **Enhanced Location Data**

For better location accuracy, you can enhance your resource locations:

```sql
-- Add coordinates to your resources table
ALTER TABLE resources ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE resources ADD COLUMN longitude DECIMAL(11, 8);

-- Example data
UPDATE resources SET 
  latitude = 40.7128, 
  longitude = -74.0060 
WHERE name = 'Study Pod A';
```

### 3. **Custom Map Styling**

You can customize the map appearance by adding style parameters:

```javascript
// Example with custom styling
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}&style=feature:poi|element:labels|visibility:off`;
```

## Features Included

### ✅ **What's Already Working:**
- **View on Map** - Opens Google Maps with location search
- **Get Directions** - Opens Google Maps with directions
- **Email Integration** - Maps links in confirmation emails
- **Mobile Friendly** - Works on all devices
- **No API Key Required** - Uses public Google Maps URLs

### 🔧 **What You Can Add:**
- **Embedded Maps** - Show map previews in the app
- **Geolocation** - Get user's current location for better directions
- **Custom Markers** - Add custom pins for your resources
- **Street View** - Add street view integration
- **Real-time Traffic** - Show traffic conditions

## Usage Examples

### Basic Location
```
Location: "Floor 1, Section A"
```

### Detailed Address
```
Location: "123 Main Street, New York, NY 10001"
```

### Building + Floor
```
Location: "Tech Building, Floor 3, Room 301"
```

## Best Practices

1. **Use Descriptive Locations:**
   - Include building names, floor numbers, room numbers
   - Add landmarks or nearby points of interest
   - Use consistent formatting across all resources

2. **Test Your Locations:**
   - Verify each location works in Google Maps
   - Test on both desktop and mobile devices
   - Check that directions are accurate

3. **Update Location Data:**
   - Keep location information current
   - Add new resources with accurate locations
   - Remove or update outdated locations

## Troubleshooting

### Common Issues:

1. **Location Not Found:**
   - Check spelling and formatting
   - Try adding more context (city, state)
   - Verify the location exists in Google Maps

2. **Directions Not Working:**
   - Ensure the location is accessible by road
   - Add street address if using building names
   - Test with different starting points

3. **Mobile Issues:**
   - Ensure the app opens Google Maps app on mobile
   - Test with different mobile browsers
   - Check if Google Maps app is installed

## Security Considerations

- **No API Key Required** - Current implementation is secure
- **Public URLs Only** - Uses Google's public mapping service
- **No User Data Sent** - Only location strings are used
- **HTTPS Required** - Works only on secure connections

## Future Enhancements

1. **Real-time Location Sharing**
2. **Custom Map Themes**
3. **Location-based Notifications**
4. **Integration with Calendar Apps**
5. **Multi-stop Directions** (for multiple bookings)

## Support

If you encounter issues:

1. Test the location directly in Google Maps
2. Check the browser console for errors
3. Verify the location string format
4. Test on different devices and browsers

The current implementation provides a solid foundation for location services without requiring any additional setup or API keys! 