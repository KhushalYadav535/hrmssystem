'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  date: string;
  title: string;
  type: 'leave' | 'holiday' | 'event';
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateClick?: (date: string) => void;
}

export default function CalendarView({ events, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = [];
  const firstDay = getFirstDay(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const hasEvent = (day: number | null) => {
    if (!day) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(e => e.date === dateStr);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'leave':
        return 'bg-blue-500/20 border-blue-500';
      case 'holiday':
        return 'bg-red-500/20 border-red-500';
      case 'event':
        return 'bg-green-500/20 border-green-500';
      default:
        return '';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {days.map((day, idx) => {
            const event = day ? hasEvent(day) : null;
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            
            return (
              <button
                key={idx}
                onClick={() => day && onDateClick?.(dateStr)}
                className={cn(
                  'aspect-square p-1 rounded-lg text-sm font-medium transition-all border',
                  day ? 'hover:bg-secondary cursor-pointer' : 'bg-muted/30 cursor-default',
                  event ? `${getEventColor(event.type)} border-2` : 'border-border',
                  day ? 'bg-card' : ''
                )}
              >
                {day && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="font-semibold">{day}</div>
                    {event && <div className="text-xs text-primary mt-1">●</div>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Legend:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-muted-foreground">Event</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
