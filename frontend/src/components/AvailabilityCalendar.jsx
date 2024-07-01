import React, { useState } from 'react';
import './AvailabilityCalendar.css';

const Calendar = ({ days, times }) => {
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startSlot, setStartSlot] = useState(null);
  const [currentTempSlots, setCurrentTempSlots] = useState(new Set());
  const [isDeselecting, setIsDeselecting] = useState(false);

  const handleMouseDown = (day, time) => {
    const slot = `${day}-${time}`;
    const isSlotSelected = selectedSlots.has(slot);

    setIsMouseDown(true);
    setStartSlot(slot);
    setIsDeselecting(isSlotSelected);
    setCurrentTempSlots(new Set([slot])); // Start with the initial slot
  };

  const handleMouseEnter = (day, time) => {
    if (!isMouseDown) return;
  
    const slot = `${day}-${time}`;
    if (!startSlot) return;
  
    const startDayIndex = days.indexOf(startSlot.split('-')[0]);
    const currentDayIndex = days.indexOf(day);
    const [startTime] = startSlot.split('-').slice(-1).map(Number);
    const currentTime = time;
  
    const minDayIndex = Math.min(startDayIndex, currentDayIndex);
    const maxDayIndex = Math.max(startDayIndex, currentDayIndex);
    const minTime = Math.min(startTime, currentTime);
    const maxTime = Math.max(startTime, currentTime);
  
    const newTempSlots = new Set();
  
    for (let d = minDayIndex; d <= maxDayIndex; d++) {
      for (let t = minTime; t <= maxTime; t++) {
        newTempSlots.add(`${days[d]}-${t}`);
      }
    }
  
    setCurrentTempSlots(newTempSlots);
  
    // Prevent default actions like text selection
    if (document.getSelection) {
      document.getSelection().removeAllRanges();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  };  

  const handleMouseUp = () => {
    setIsMouseDown(false);
    const newSelectedSlots = new Set(selectedSlots);

    currentTempSlots.forEach(slot => {
      if (isDeselecting) {
        newSelectedSlots.delete(slot);
      } else {
        newSelectedSlots.add(slot);
      }
    });

    console.log(newSelectedSlots)

    setSelectedSlots(newSelectedSlots);
    setStartSlot(null);
    setCurrentTempSlots(new Set());
    setIsDeselecting(false);
  };

  const renderTimeSlots = (day) => {
    return times.map(time => {
      const slot = `${day}-${time}`;
      const isSelected = selectedSlots.has(slot);
      const isTempSelected = currentTempSlots.has(slot);
      const isDeselected = isDeselecting && isTempSelected;
      const shouldBeSelected = !isDeselecting && isTempSelected;

      return (
        <div
          key={slot}
          className={`calendar-time-slot ${isSelected ? 'selected' : ''} ${isDeselected ? 'deselecting' : ''} ${shouldBeSelected ? 'temp-selected' : ''}`}
          onMouseDown={() => handleMouseDown(day, time)}
          onMouseEnter={() => handleMouseEnter(day, time)}
          onMouseUp={handleMouseUp}
        >
        </div>
      );
    });
  };

  const renderDays = () => {
    return days.map(day => (
      <div key={day} className="calendar-day">
        <div className="calendar-day-label">{day}</div>
        {renderTimeSlots(day)}
      </div>
    ));
  };

  return (
    <div className="calendar">
      <div className="calendar-grid">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
