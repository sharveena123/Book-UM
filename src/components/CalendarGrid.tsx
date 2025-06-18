
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, addHours, isSameDay, isWithinInterval, startOfDay } from 'date-fns';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
}

interface CalendarGridProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  bookings: Booking[];
  onTimeSlotSelect: (start: Date, end: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onDateChange,
  bookings,
  onTimeSlotSelect
}) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 14 }, (_, i) => 8 + i); // 8 AM to 9 PM

  const isSlotBooked = (day: Date, hour: number) => {
    const slotStart = addHours(startOfDay(day), hour);
    const slotEnd = addHours(slotStart, 1);

    return bookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      
      return (
        bookingStart < slotEnd && bookingEnd > slotStart
      );
    });
  };

  const handleSlotClick = (day: Date, hour: number) => {
    if (isSlotBooked(day, hour)) return;
    
    const start = addHours(startOfDay(day), hour);
    const end = addHours(start, 1);
    onTimeSlotSelect(start, end);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -7 : 7);
    onDateChange(newDate);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Weekly Calendar
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-1 min-w-[800px]">
            {/* Header row */}
            <div className="text-xs font-medium text-gray-500 p-2">Time</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-xs font-medium text-gray-900 p-2 text-center">
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-xs text-gray-500 p-2 border-r">
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const isBooked = isSlotBooked(day, hour);
                  const isPast = addHours(startOfDay(day), hour) < new Date();
                  
                  return (
                    <button
                      key={`${day.toISOString()}-${hour}`}
                      onClick={() => handleSlotClick(day, hour)}
                      disabled={isBooked || isPast}
                      className={`
                        h-12 border border-gray-200 text-xs transition-colors
                        ${isBooked 
                          ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                          : isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-50 hover:bg-green-100 text-green-800 cursor-pointer'
                        }
                      `}
                    >
                      {isBooked ? 'Booked' : isPast ? 'Past' : 'Available'}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-200 mr-2"></div>
            Available
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 mr-2"></div>
            Booked
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 mr-2"></div>
            Past
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarGrid;
