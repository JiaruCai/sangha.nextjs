// app/client-calendar.js

'use client';
import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function ClientCalendar({ children }) {
  const [events, setEvents] = useState([]);
  const currentDate = new Date(); // Current date

  // Sample events data, replace with your actual events data
  const sampleEvents = [
    {
      id: 1,
      title: 'Event 1',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0), // Current date, 10:00 AM
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0), // Current date, 12:00 PM
    },
    {
      id: 2,
      title: 'Event 2',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0), // Current date, 2:00 PM
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0), // Current date, 4:00 PM
    },
  ];

  // Function to handle event selection
  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
  };

  return (
    <>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        defaultDate={currentDate} // Set default date to current date
      />
      {children}
    </>
  );
}
