import "./DayColumn.css";
import { useState, useEffect, useRef } from "react";

export function DayColumn({ day, timeInterval, startTime, availability, flashEditButton }) {
    const { data, display, userId } = availability;
    const [selectedTimes, setSelectedTimes] = useState([]);
    const isDragging = useRef(false);
    const dayColumnRef = useRef(null);
    const action = useRef("ADD"); // Using useRef to keep track of action type

    useEffect(() => {
        setSelectedTimes(data.filter(slot => slot.day === day && slot.userId === userId));
    }, [data, day, userId]);

    const handleMouseDown = (event, time) => {
        event.preventDefault();
        isDragging.current = true;
        action.current = selectedTimes.some(slot => slot.time === time) ? "REMOVE" : "ADD";
        updateAvailability(time);
    };

    const handleMouseOver = (event, time) => {
        event.preventDefault();
        if (isDragging.current) {
            updateAvailability(time);
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        // Here you can handle the "set" action if needed
    };

    const updateAvailability = (time) => {
        setSelectedTimes(prevTimes => {
            const isSelected = prevTimes.some(slot => slot.time === time);

            if (action.current === "ADD") {
                // Toggle selection if not already selected
                return [...prevTimes, { day, time, userId }];
            } else {
                // Remove selection if already selected
                return prevTimes.filter(slot => !(slot.day === day && slot.time === time && slot.userId === userId));
            }
        });
    };

    const formatTime = (hour, minute) => `${hour}:${minute < 10 ? '0' : ''}${minute}`;

    const isSelected = (time) => selectedTimes.some(slot => slot.time === time && slot.day === day);

    const hours = Array.from({ length: timeInterval }, (_, i) => {
        const hour = parseInt(startTime) + i;
        const times = [0, 15, 30, 45].map(minute => formatTime(hour, minute));

        return (
            <div key={hour} className="time-cell-hour">
                {times.map(time => (
                    <div
                        key={time}
                        data-time={time}
                        className={`time-cell-15 ${isSelected(time) ? 'selected' : ''}`}
                        onMouseDown={(e) => handleMouseDown(e, time)}
                        onMouseOver={(e) => handleMouseOver(e, time)}
                        onMouseUp={handleMouseUp}
                    />
                ))}
            </div>
        );
    });

    return (
        <div className="column">
            <div className="day-title">{day}</div>
            <div className="day-column" ref={dayColumnRef}>
                {hours}
            </div>
        </div>
    );
}