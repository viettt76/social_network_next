'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';

interface DatePickerProps {
    value?: Date | string | null;
    onChange?: (date: Date | null) => void;
}

const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
}));

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const parseDate = (value?: Date | string | null) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isValid(date) ? date : null;
};

export default function DatePicker({ value, onChange }: DatePickerProps) {
    const parsedValue = React.useMemo(() => parseDate(value), [value]);

    const [date, setDate] = React.useState<Date | null>(parsedValue);
    const [calendarDate, setCalendarDate] = React.useState<Date>(parsedValue || new Date());
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setDate(parsedValue);
        setCalendarDate(parsedValue || new Date());
    }, [parsedValue]);

    const handleDateChange = (newDate: Date) => {
        setDate(newDate);
        onChange?.(newDate);
        setIsOpen(false);
    };

    const handleMonthChange = (month: number) => {
        setCalendarDate((prev) => new Date(prev.getFullYear(), month, 1));
    };

    const handleYearChange = (year: number) => {
        setCalendarDate((prev) => new Date(year, prev.getMonth(), 1));
    };

    const prevMonth = () => handleMonthChange(calendarDate.getMonth() - 1);
    const nextMonth = () => handleMonthChange(calendarDate.getMonth() + 1);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : 'Chọn ngày'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-4">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-2">
                        <select
                            value={calendarDate.getMonth()}
                            onChange={(e) => handleMonthChange(Number(e.target.value))}
                            className={cn('border rounded-md p-1')}
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={calendarDate.getFullYear()}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            className={cn('border rounded-md p-1')}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button variant="ghost" size="sm" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Calendar date={calendarDate} onSelect={handleDateChange} />
            </PopoverContent>
        </Popover>
    );
}

interface CalendarProps {
    date: Date;
    onSelect: (date: Date) => void;
}

function Calendar({ date, onSelect }: CalendarProps) {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = Array.from({ length: endDate.getDate() }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-7 gap-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <span key={day} className="text-center font-semibold">
                    {day}
                </span>
            ))}

            {Array.from({ length: startDate.getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
            ))}

            {daysInMonth.map((day) => (
                <Button
                    key={day}
                    variant={day === date.getDate() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSelect(new Date(date.getFullYear(), date.getMonth(), day))}
                >
                    {day}
                </Button>
            ))}
        </div>
    );
}
