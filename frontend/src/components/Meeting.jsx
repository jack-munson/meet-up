import { FaRegClock } from "react-icons/fa6"
import { MdToday } from "react-icons/md"
import { FaRedoAlt } from "react-icons/fa"
import "./Meeting.css"
import { useEffect, useState } from "react"

export function Meeting({ title, startTime, endTime, days, meetingStart, meetingEnd, frequency, onClick }) {
    const [isMeetingScheduled, setIsMeetingScheduled] = useState(false)

    useEffect(() => {
        setIsMeetingScheduled(meetingStart && meetingEnd)
    }, [meetingStart, meetingEnd])

    const formatDays = (daysArr) => {
        if (daysArr.length <= 10) {
            return daysArr.join(", ")
        } else {
            return daysArr.slice(0,10).join(", ") + "..."
        }
    }

    const formatTimeFromHour = (time) => {
        const hours = Math.floor(time);
        const minutes = (time % 1) * 60;
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours}${minutes === 0 ? '' : ':30'} ${ampm}`;
    }

    const formatTimeFromSlot = (slot) => {
        const [date, time] = slot.split('-');
        return formatTimeFromHour(time)
    }

    const formatMonthOrDay = (slot) => {
        const [date, time] = slot.split('-');
        const [month, day] = date.split('/');

        const dateObj = new Date(`2000-${month}-01`); // Year and day don't matter here

        const monthName = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();

        return monthName === "INVALID DATE" ? date : monthName.toUpperCase()
    }

    const formatDate = (slot) => {
        const [date, time] = slot.split('-');
        const [month, day] = date.split('/');

        return day
    }

    return (
        <div className="meeting-container" onClick={onClick}>
            <div className="meeting-info">
                <div className="meeting-info-title">
                    {title}
                </div>
                <div className="meeting-info-details">
                    <FaRegClock size={18} className="clock-icon" />
                    {formatTimeFromHour(startTime)} - {formatTimeFromHour(endTime)}
                </div>
                <div className="meeting-info-details">
                    <MdToday size={20} className="calendar-icon" />
                    {formatDays(days)}
                </div>
            </div>
            <div className="scheduled">
                <div className="divider"> </div>
                {isMeetingScheduled ? 
                    <div className="scheduled-info">
                    <div className="scheduled-day">
                        <div>
                            {formatMonthOrDay(meetingStart)}
                        </div>
                        <div>
                            {frequency === "one-time" ?
                                formatDate(meetingStart) : 
                                <FaRedoAlt size={18} className="recurring-icon"/>
                            }
                        </div>
                    </div>
                    <div className="scheduled-time">
                        {formatTimeFromSlot(meetingStart)} - {formatTimeFromSlot(meetingEnd)}
                    </div>
                    </div> :
                    <div className="no-meeting-text">
                        No meeting<br/>scheduled
                    </div>
                }
            </div>
        </div>
    )
}