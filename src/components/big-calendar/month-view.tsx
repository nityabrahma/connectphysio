
'use client';

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '.';
import type { Session } from '@/types/domain';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent<Session>[];
  eventComponent: React.ComponentType<{ event: CalendarEvent<Session> }>;
}

export function MonthView({ date, events, eventComponent: EventComponent }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weekStart = startOfWeek(monthStart);
    const weekEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [date]);
  
  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(e.start, day));
  }
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 grid-rows-1 h-full">
        {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold p-2 border-b border-r text-sm">
                {day}
            </div>
        ))}
      <div className="col-span-7 grid grid-cols-7 grid-rows-5 flex-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={index}
              className={cn(
                "border-b border-r p-1 flex flex-col min-h-[120px]",
                !isSameMonth(day, date) && "bg-muted/50 text-muted-foreground"
              )}
            >
              <span className={cn(
                "font-semibold text-sm",
                 isSameDay(day, new Date()) && "text-primary font-bold"
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1 flex-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div key={event.id} className="h-6">
                    <EventComponent event={event} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
