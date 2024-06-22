import React, { useState } from "react"
import {Calendar} from "react-multi-date-picker"
import "./DatePicker.css"

export function DatePicker({ handleDateChange, dates}) {
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setMonth(oneYearLater.getMonth() + 12);

  return (
    <Calendar 
        value={dates.map(date => new Date(date))} 
        onChange={handleDateChange} 
        multiple="true"
        disableMonthPicker
        disableYearPicker
        minDate={today}
        maxDate={oneYearLater}
        mapDays={({ date }) => {
            const isPastDate = date.valueOf() < today.valueOf()
            if (isPastDate) {
              return {
                disabled: true,
              };
            }
          }}
    />
  )
} 