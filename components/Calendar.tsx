
import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    onClose?: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onChange, onClose }) => {
    const [viewDate, setViewDate] = React.useState(new Date(selectedDate));

    // Sync view if selected date changes drastically (optional, usually good to keep view stable)
    React.useEffect(() => {
        if (selectedDate.getMonth() !== viewDate.getMonth() || selectedDate.getFullYear() !== viewDate.getFullYear()) {
           setViewDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sunday

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    
    // Shift to Monday start (0=Mon, 6=Sun)
    // Standard JS: 0=Sun, 1=Mon, ..., 6=Sat
    // Desired: Mon(0), ..., Sun(6)
    // Mapping: Sun(0)->6, Mon(1)->0, Tue(2)->1
    const offset = (startDay === 0 ? 6 : startDay - 1);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (e: React.MouseEvent, day: number) => {
        e.stopPropagation();
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(newDate);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        onChange(today);
        setViewDate(today);
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Reset to today as a safe default
        const today = new Date();
        onChange(today);
        setViewDate(today);
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() && 
               viewDate.getMonth() === selectedDate.getMonth() && 
               viewDate.getFullYear() === selectedDate.getFullYear();
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && 
               viewDate.getMonth() === today.getMonth() && 
               viewDate.getFullYear() === today.getFullYear();
    };

    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 w-[280px] select-none animate-fade-in z-50 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center font-bold text-gray-800 dark:text-white text-sm">
                    <span className="mr-1">{viewDate.toLocaleString('default', { month: 'long' })}</span>
                    <span>{viewDate.getFullYear()}</span>
                 </div>
                 <div className="flex items-center space-x-1">
                     <button onClick={handlePrevMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors">
                        <ChevronLeftIcon className="w-4 h-4" />
                     </button>
                     <button onClick={handleNextMonth} type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors">
                        <ChevronRightIcon className="w-4 h-4" />
                     </button>
                 </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                 {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelected(day);
                    const today = isToday(day);
                    
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={(e) => handleDateClick(e, day)}
                            className={`
                                h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center transition-all duration-200
                                ${selected 
                                    ? 'bg-blue-600 text-white shadow-md font-bold' // Matching the blue selection from screenshot 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                                ${!selected && today ? 'text-blue-500 font-semibold' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleClear} type="button" className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded">
                    Clear
                </button>
                <button onClick={handleToday} type="button" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors px-2 py-1 rounded">
                    Today
                </button>
            </div>
        </div>
    );
};
