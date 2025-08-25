"use client";

import { eachHourOfInterval, format, isSameDay } from "date-fns";
import { useMemo } from "react";
import type { CalendarEvent } from ".";
import type { Session } from "@/types/domain";

interface DayViewProps {
  date: Date;
  events: CalendarEvent<Session>[];
  eventComponent: React.ComponentType<{ event: CalendarEvent<Session> }>;
}

export function DayView({
  date,
  events,
  eventComponent: EventComponent,
}: DayViewProps) {
  const hours = useMemo(() => {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    return eachHourOfInterval({ start: startOfDay, end: endOfDay });
  }, [date]);

  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, date)),
    [events, date]
  );

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const top = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
    const height =
      ((endHour * 60 + endMinute - (startHour * 60 + startMinute)) /
        (24 * 60)) *
      100;

    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="flex flex-col size-full">
      <header className="flex border-b">
        <div className="w-full border-r"></div>
        <div className="flex size-full text-center font-semibold py-2">
          {format(date, "EEE, MMM d")}
        </div>
      </header>
      <div className="flex size-full flex-col justify-center items-center relative">
        {hours.map((hour, index) => (
          <div key={index} className="flex h-full border-b size-full">
            <div className="w-16 border-r text-xs text-muted-foreground p-1 text-right">
              {format(hour, "h a")}
            </div>
            <div className="flex-1"></div>
          </div>
        ))}
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="absolute w-full px-2"
            style={getEventPosition(event)}
          >
            <EventComponent event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
