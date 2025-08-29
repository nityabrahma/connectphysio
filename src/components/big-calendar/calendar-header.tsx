
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import type { CalendarView } from '.';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as MiniCalendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarHeader({ currentDate, onDateChange, view, onViewChange }: CalendarHeaderProps) {
  const handlePrev = () => {
    switch (view) {
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'day':
        onDateChange(subDays(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };
  
  const dateFormat = () => {
    switch (view) {
      case 'month':
        return 'MMMM yyyy';
      case 'week':
        return `MMM d, yyyy`;
      case 'day':
        return 'MMMM d, yyyy';
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-b gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4"/></Button>
        <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
        <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4"/></Button>
        
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-[200px] justify-start text-left font-normal ml-4",
                    !currentDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <MiniCalendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(d) => d && onDateChange(d)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
      </div>
      <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
