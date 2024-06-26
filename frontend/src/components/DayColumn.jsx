import "./DayColumn.css"
import { useState } from "react";

export function DayColumn({ day, timeInterval, startTime, handleSlotClick, availability, maxCount }) {

    const data = availability.data
    const display = availability.display
    const userId = availability.userId

    const formatTime = (hour, minute) => {
        return `${hour}:${minute}`
    }

    var dayAvailability = []
    if (display === 'all') {
        dayAvailability = data.filter(a => a.day === day)
    }
    else {
        dayAvailability = data.filter(a => a.day === day && a.userId === userId)
    }

    const countAvailability = (time) => {
        return dayAvailability.filter(a => a.time === time).length;
    }

    const getColorIntensity = (count) => {
        const intensity = count / (maxCount + 1)
        const color = `rgba(30, 150, 92, ${intensity})`
        return color;
    }
    
    const hours = []
    for (let i = 0; i < timeInterval; i++) {
        const hour = parseInt(startTime) + i
        const times = [
            formatTime(hour, 0),
            formatTime(hour, 15),
            formatTime(hour, 30),
            formatTime(hour, 45)
        ]

        hours.push(
            <div key={hour} className="time-cell-hour">
                <div className="time-cell-30-top">
                    <div 
                        className="time-cell-15" 
                        style={{backgroundColor: getColorIntensity(countAvailability(times[0]))}} 
                        onClick={() => handleSlotClick(day, times[0])}>
                    </div>
                    <div 
                        className="time-cell-15" 
                        style={{backgroundColor: getColorIntensity(countAvailability(times[1]))}} 
                        onClick={() => handleSlotClick(day, times[1])}>
                    </div>
                </div>
                <div className="time-cell-30-bottom">
                    <div 
                        className="time-cell-15" 
                        style={{backgroundColor: getColorIntensity(countAvailability(times[2]))}} 
                        onClick={() => handleSlotClick(day, times[2])}>
                    </div>
                    <div 
                        className="time-cell-15" 
                        style={{backgroundColor: getColorIntensity(countAvailability(times[3]))}} 
                        onClick={() => handleSlotClick(day, times[3])}>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="column">
            <div className="day-title">{day}</div>
                <div className="day-column">
                {hours}
                </div>
        </div>
    )
}