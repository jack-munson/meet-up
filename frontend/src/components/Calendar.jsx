import "./Calendar.css"
import { DayColumn } from "./DayColumn"
import { format, addDays, startOfWeek } from 'date-fns';

export function Calendar() {
    return (
        <div className="availability-viewer">
            <div className="calendar-container">
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
                <DayColumn></DayColumn>
            </div>
        </div>
    )
}