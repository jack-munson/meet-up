import "./DayColumn.css";
import { useState, useEffect, useRef } from "react";
import { boxesIntersect, useSelectionContainer } from "@air/react-drag-to-select";

export function DayColumn({ day, timeInterval, startTime, handleSlotClick, availability, maxCount }) {
    const [timesToSelect, setTimesToSelect] = useState([]);
    const selectableItems = useRef([]);
    const dayColumnRef = useRef(null);

    const { DragSelection } = useSelectionContainer({
        eventsElement: dayColumnRef.current, // Use the day-column container for events
        onSelectionChange: (box) => {
            const selectedTimes = [];
            selectableItems.current.forEach((item) => {
                const { time, rect } = item;
                
                if (boxesIntersect(box, rect)) {
                    selectedTimes.push(time);
                    console.log(time)
                }
            });

            setTimesToSelect(selectedTimes);
        },
        onSelectionStart: () => console.log("Selection start"),
        onSelectionEnd: () => console.log("Selection ended"),
        selectionProps: {
            style: {
                border: "2px dashed purple",
                borderRadius: 4,
                backgroundColor: "brown",
                opacity: 0.5
            }
        },
        isEnabled: true
    });

    useEffect(() => {
        if (dayColumnRef.current) {
            // Clear existing items
            selectableItems.current = [];

            // Iterate over each time slot and register it
            Array.from(dayColumnRef.current.querySelectorAll(".time-cell-15")).forEach((item) => {
                const time = item.getAttribute("data-time");
                const rect = item.getBoundingClientRect();
                selectableItems.current.push({
                    element: item,
                    rect,
                    time
                });
            });
        }
    }, []);

    const data = availability.data;
    const display = availability.display;
    const userId = availability.userId;

    const formatTime = (hour, minute) => {
        return `${hour}:${minute}`;
    };

    var dayAvailability = [];
    if (display === 'all') {
        dayAvailability = data.filter(a => a.day === day);
    } else {
        dayAvailability = data.filter(a => a.day === day && a.userId === userId);
    }

    const countAvailability = (time) => {
        return dayAvailability.filter(a => a.time === time).length;
    };

    const getColorIntensity = (count) => {
        const intensity = count / (maxCount + 1);
        return `rgba(30, 150, 92, ${intensity})`;
    };

    const hours = [];
    for (let i = 0; i < timeInterval; i++) {
        const hour = parseInt(startTime) + i;
        const times = [
            formatTime(hour, 0),
            formatTime(hour, 15),
            formatTime(hour, 30),
            formatTime(hour, 45)
        ];

        hours.push(
            <div key={hour} className="time-cell-hour">
                <div className="time-cell-30-top">
                    <div
                        data-time={times[0]}
                        className={`time-cell-15 ${timesToSelect.includes(times[0]) ? 'selected' : ''}`}
                        style={{ backgroundColor: getColorIntensity(countAvailability(times[0])) }}
                        onClick={() => handleSlotClick(day, times[0])}>
                    </div>
                    <div
                        data-time={times[1]}
                        className={`time-cell-15 ${timesToSelect.includes(times[1]) ? 'selected' : ''}`}
                        style={{ backgroundColor: getColorIntensity(countAvailability(times[1])) }}
                        onClick={() => handleSlotClick(day, times[1])}>
                    </div>
                </div>
                <div className="time-cell-30-bottom">
                    <div
                        data-time={times[2]}
                        className={`time-cell-15 ${timesToSelect.includes(times[2]) ? 'selected' : ''}`}
                        style={{ backgroundColor: getColorIntensity(countAvailability(times[2])) }}
                        onClick={() => handleSlotClick(day, times[2])}>
                    </div>
                    <div
                        data-time={times[3]}
                        className={`time-cell-15 ${timesToSelect.includes(times[3]) ? 'selected' : ''}`}
                        style={{ backgroundColor: getColorIntensity(countAvailability(times[3])) }}
                        onClick={() => handleSlotClick(day, times[3])}>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="column">
            <div className="day-title">{day}</div>
            <div className="day-column" ref={dayColumnRef}>
                <DragSelection />
                {hours}
            </div>
        </div>
    );
}
