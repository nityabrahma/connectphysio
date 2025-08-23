
'use client';

import { startOfWeek, endOfWeek, eachDayOfInterval, format, eachHourOfInterval, isSameDay } from 'date-fns';
import { useMemo } from 'react';
import type { CalendarEvent } from '.';
import type { Session } from '@/types/domain';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent<Session>[];
  eventComponent: React.ComponentType<{ event: CalendarEvent<Session> }>;
}

export function WeekView({ date, events, eventComponent: EventComponent }: WeekViewProps) {
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [date]);
  
  const hours = useMemo(() => {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    return eachHourOfInterval({ start: startOfDay, end: endOfDay });
  }, [date]);

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(e.start, day));
  }
  
  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const top = (startHour * 60 + startMinute) / (24 * 60) * 100;
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (24 * 60) * 100;

    return { top: `${top}%`, height: `${height}%` };
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex border-b sticky top-0 bg-card z-10">
        <div className="w-16 border-r"></div>
        {weekDays.map(day => (
          <div key={day.toString()} className="flex-1 text-center font-semibold p-2 border-r">
            {format(day, 'EEE d')}
          </div>
        ))}
      </header>
      <div className="flex flex-1">
        <div className="w-16">
          {hours.map((hour, index) => (
            <div key={index} className="h-16 border-r text-xs text-muted-foreground p-1 text-right">
              {format(hour, 'h a')}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 relative">
          {weekDays.map((day, dayIndex) => (
            <div key={day.toString()} className="relative border-r">
              {hours.map((_, hourIndex) => (
                <div key={hourIndex} className="h-16 border-b"></div>
              ))}
              {getEventsForDay(day).map(event => (
                <div
                    key={event.id}
                    className="absolute w-full px-1"
                    style={{...getEventPosition(event), left: `${dayIndex * (100/7)}%`, width: `${100/7}%` }}
                >
                    <EventComponent event={event} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
