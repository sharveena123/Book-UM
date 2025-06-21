import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, addHours, isSameDay, isWithinInterval, startOfDay, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
  title?: string;
}

interface CalendarGridProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  bookings: Booking[];
  selectedSlots: { start: Date; end: Date }[];
  onTimeSlotSelect: (start: Date, end: Date) => void;
  onClearSelection?: () => void;
  resource?: {
    name: string;
    location: string;
  };
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onDateChange,
  bookings,
  selectedSlots,
  onTimeSlotSelect,
  onClearSelection,
  resource,
}) => {
  const [selectedStartTime, setSelectedStartTime] = useState<string>('09:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('10:00');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Generate time options from 8 AM to 9 PM
  const timeOptions = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleAddTimeSlot = () => {
    if (!selectedDate) return;

    const [startHour, startMinute] = selectedStartTime.split(':').map(Number);
    const [endHour, endMinute] = selectedEndTime.split(':').map(Number);

    const start = addHours(startOfDay(selectedDate), startHour);
    const end = addHours(startOfDay(selectedDate), endHour);

    // Validate that end time is after start time
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    // Check if the time slot conflicts with existing bookings
    const hasConflict = bookings.some(booking => {
      const bookingStart = parseISO(booking.start_time);
      const bookingEnd = parseISO(booking.end_time);
      return (
        (start < bookingEnd && end > bookingStart) ||
        (bookingStart < end && bookingEnd > start)
      );
    });

    if (hasConflict) {
      alert('This time slot conflicts with an existing booking');
      return;
    }

    // Replace existing selection with new slot (only allow 1 slot)
    onTimeSlotSelect(start, end);
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.start_time);
      return isSameDay(bookingDate, date);
    });
  };

  const isDateBooked = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  const getBookingCount = (date: Date) => {
    return getBookingsForDate(date).length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Date and Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      onDateChange(date);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Time Slot Button */}
          <Button 
            onClick={handleAddTimeSlot}
            className="w-full"
            disabled={!selectedDate}
          >
            <Clock className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>

          {/* Selected Time Slot */}
          {selectedSlots.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Time Slot</Label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">{format(selectedSlots[0].start, "PPP")}</div>
                  <div className="text-blue-600">
                    {format(selectedSlots[0].start, "h:mm a")} - {format(selectedSlots[0].end, "h:mm a")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="text-red-600 hover:text-red-700 mt-2"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar View - Takes up 2 columns */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Month Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-sm font-medium text-gray-500 p-3 text-center border-b">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 0 }), i);
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  const isToday = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, selectedDate);
                  const dayBookings = getBookingsForDate(date);
                  const hasBookings = dayBookings.length > 0;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[120px] border border-gray-200 text-xs p-2 cursor-pointer transition-colors",
                        !isCurrentMonth && "text-gray-300 bg-gray-50",
                        isToday && "bg-blue-100 border-blue-300",
                        isSelected && "bg-blue-200 border-blue-400 font-bold",
                        hasBookings && "bg-red-50 border-red-200"
                      )}
                      onClick={() => onDateChange(date)}
                    >
                      <div className="text-right font-medium text-sm mb-2">{format(date, "d")}</div>
                      {hasBookings && (
                        <div className="space-y-1">
                          {dayBookings.map((booking, idx) => (
                            <div key={idx} className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded border border-red-300">
                              <div className="font-medium">
                                {format(parseISO(booking.start_time), "h:mm a")} - {format(parseISO(booking.end_time), "h:mm a")}
                              </div>
                              {booking.title && (
                                <div className="text-red-700 truncate">{booking.title}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-300 mr-2"></div>
                  Selected
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 mr-2"></div>
                  Has Bookings
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 mr-2"></div>
                  Today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarGrid;
