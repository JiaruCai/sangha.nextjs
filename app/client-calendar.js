'use client';
import React, { useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ClientCalendar.css'; // Import CSS file for custom styling

const localizer = momentLocalizer(moment);

export default function ClientCalendar({ children }) {
  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Calculate the start of the current week
  const startOfWeek = moment().startOf('week');

  // Calculate the start of the current hour
  const startOfHour = moment().startOf('hour');

  // Calculate the current date and time rounded to the nearest hour
  const currentDateAndHour = moment(startOfWeek).add(moment().hour(), 'hours');

  // Function to handle event selection
  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
  };

  // Function to handle slot selection
  const handleSelectSlot = (slotInfo) => {
    console.log('Selected slot:', slotInfo);
    // Check if the selected slot starts after the current date and time
    const selectedStartTime = moment(slotInfo.start);
    const currentDateTime = moment();
    if (selectedStartTime.isAfter(currentDateTime)) {
      // Construct the Jitsi meeting link based on the selected time slot
      const jitsiMeetingLink = 'https://3lxnq0a6m89.typeform.com/to/Ch2iSbtf';
      // Open the Jitsi meeting link in a new tab
      window.open(jitsiMeetingLink, '_blank');
    } else {
      // Do nothing if the selected slot is before the current date and time
      setShowPopup(true);
      console.log('Cannot schedule a meeting for past time slots.');
    }
  };

  // Function to close the popup window
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Function to render time slot with a blue button
  const renderTimeSlot = ({ showLabel, ...props }) => {
    const slotDuration = moment.duration(moment(props.end).diff(moment(props.start)));
    const maxDuration = moment.duration({ minutes: 45 });
    const isSelectable = slotDuration <= maxDuration && slotDuration.asMinutes() % 15 === 0;

    return (
      <div
        {...props}
        style={{
          position: 'relative',
          paddingLeft: '10px',
        }}
      >
        {props.children}
        {props.showLabel && isSelectable && (
          <button
            onClick={() => handleSelectSlot(props.slotInfo)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '-40px',
              transform: 'translateY(-50%)',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Schedule
          </button>
        )}
      </div>
    );
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
        onSelectSlot={handleSelectSlot}
        defaultDate={currentDateAndHour} // Set default date to current date and hour
        views={['week']} // Set default view to week
        defaultView={Views.WEEK} // Set default view to week
        selectable={true} // Enable slot selection
        components={{
          timeSlotWrapper: renderTimeSlot,
        }}
      />
      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup">
            <span className="close" onClick={handleClosePopup}>
              &times;
            </span>
            <p>Still inventing time machine~ Can&apos;t travel backwards at the moment!</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
