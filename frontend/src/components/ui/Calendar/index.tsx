'use client';

import * as React from 'react';
import { useState } from 'react';

export interface CalendarProps {
  /**
   * Selection mode: single or multiple
   */
  mode?: 'single' | 'range' | 'multiple';
  /**
   * Currently selected date
   */
  selected?: Date | Date[] | null;
  /**
   * Date selection callback
   */
  onSelect?: (date: Date | null) => void;
  /**
   * Disabled dates
   */
  disabled?: boolean;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Simplified calendar component
 * Note: This is a simplified implementation, only for basic date selection functionality
 * In production environment, it's recommended to use mature date picker libraries like react-datepicker or @mui/x-date-pickers
 */
export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  disabled = false,
  minDate,
  maxDate,
  className = '',
}) => {
  // Current year and month being displayed
  const [viewDate, setViewDate] = useState(() => {
    if (selected instanceof Date) {
      return selected;
    }
    return new Date();
  });

  // Get the number of days in the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the day of week for the first day of the month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if the date is selected
  const isSelected = (date: Date) => {
    if (!selected) return false;
    
    if (selected instanceof Date) {
      return date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate();
    }
    
    if (Array.isArray(selected)) {
      return selected.some(selectedDate => 
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate()
      );
    }
    
    return false;
  };

  // Check if the date is within selectable range
  const isInRange = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (disabled || !isInRange(date)) return;
    if (onSelect) onSelect(date);
  };

  // Render calendar
  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`prev-${i}`} className="text-gray-400 p-2 text-center">
          {new Date(year, month, 0 - (firstDayOfMonth - i - 1)).getDate()}
        </div>
      );
    }
    
    // Add days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isDateSelected = isSelected(date);
      const isDateInRange = isInRange(date);
      
      days.push(
        <div
          key={`current-${i}`}
          className={`
            p-2 text-center cursor-pointer rounded-md
            ${isDateSelected ? 'bg-blue-500 text-white' : ''}
            ${!isDateInRange || disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
          `}
          onClick={() => isDateInRange && !disabled && handleDateSelect(date)}
        >
          {i}
        </div>
      );
    }
    
    // Add days from the next month to fill the grid
    const totalCells = 42; // 6行7列
    const remainingCells = totalCells - days.length;
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="text-gray-400 p-2 text-center">
          {i}
        </div>
      );
    }
    
    return days;
  };

  // Previous month
  const prevMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Next month
  const nextMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`calendar-container ${className}`}>
      <div className="calendar-header flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={disabled}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          &lt;
        </button>
        <div className="text-center font-medium">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          disabled={disabled}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>
      
      <div className="calendar-weekdays grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-days grid grid-cols-7">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;
