import React, { useState, useEffect } from 'react';
import './AvailabilityCalendar.css';

export function AvailabilityCalendar({ days, frequency, display, availability, startTime, endTime, flashEditButton }) {
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startSlot, setStartSlot] = useState(null);
  const [currentTempSlots, setCurrentTempSlots] = useState(new Set());
  const [isDeselecting, setIsDeselecting] = useState(false);
  const [initialAvailability, setInitialAvailability] = useState([]);

  useEffect(() => {
    if (frequency === 'all') {
      setInitialAvailability(availability);
    } else {
      setInitialAvailability([]);
    }
  }, [frequency, availability]);

  let times = [];
  for (let i = parseInt(startTime) * 2; i < parseInt(endTime) * 2; i++) {
    times.push(i / 2);
  }

  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${formattedHours}${minutes === 0 ? '' : ':30'} ${ampm}`;
  };

  const handleMouseDown = (day, time) => {
    if (display === 'all') {
      flashEditButton();
      return;
    }
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

    // Get indexes of start and current slots
    const startDayIndex = days.indexOf(startSlot.split('-')[0]);
    const currentDayIndex = days.indexOf(day);
    const [startTime] = startSlot.split('-').slice(-1).map(Number);
    const currentTime = time;

    const minDayIndex = Math.min(startDayIndex, currentDayIndex);
    const maxDayIndex = Math.max(startDayIndex, currentDayIndex);
    const minTime = Math.min(startTime, currentTime);
    const maxTime = Math.max(startTime, currentTime);

    const newTempSlots = new Set();

    // Add all slots in current area to temporary slots
    for (let d = minDayIndex; d <= maxDayIndex; d++) {
      for (let t = minTime; t <= maxTime; t += 0.5) {
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

    // Add all temporary slots to selected slots
    currentTempSlots.forEach((slot) => {
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
    return times.map((time) => {
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
    return days.map((day) => (
      <div key={day} className="calendar-day">
        <div className="calendar-day-label">{day}</div>
        <div className="day-slots">{renderTimeSlots(day)}</div>
      </div>
    ));
  };

  return (
    <div className='availability-viewer'>
        <div className="time-axis">
          {times.map((time, index) => (
            <div key={index} className="hour-label">
                {index % 2 === 0 && formatTime(time)}
            </div>
          ))}
        </div>
        <div className="calendar">
            <div className="calendar-grid">
            {renderDays()}
            </div>
        </div>
    </div>
  );
}
