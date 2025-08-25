"use client";

import { CalendarHeader } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import type { Session } from "@/types/domain";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent<T = any> {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: T;
}

interface CalendarProps {
  events: CalendarEvent<Session>[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  eventComponent: React.ComponentType<{ event: CalendarEvent<Session> }>;
}

export function Calendar({
  events,
  view,
  onViewChange,
  currentDate,
  onDateChange,
  eventComponent,
}: CalendarProps) {
  const renderView = () => {
    switch (view) {
      case "month":
        return (
          <MonthView
            date={currentDate}
            events={events}
            eventComponent={eventComponent}
          />
        );
      case "week":
        return (
          <WeekView
            date={currentDate}
            events={events}
            eventComponent={eventComponent}
          />
        );
      case "day":
        return (
          <DayView
            date={currentDate}
            events={events}
            eventComponent={eventComponent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-lg border">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={onDateChange}
        view={view}
        onViewChange={onViewChange}
      />
      <div className="flex-1 overflow-auto">{renderView()}</div>
    </div>
  );
}
