// Global variables
let appointmentData = [];
let reservedDates = [];

function initializeApp() {
    fetchAppointmentData().then(() => {
        populateMonthSchedule(new Date());
    });

    // Initialize Pikaday
    const picker = new Pikaday({
        field: document.getElementById('datepicker'),
        trigger: document.getElementById('calendar-button'),
        format: 'YYYY-MM-DD',
        onSelect: function(date) {
            populateMonthSchedule(date);
            picker.hide(); // Hide the calendar after a date is selected
        }
    });

    // Add event listener to the save button
    document.getElementById("save-button").addEventListener("click", saveAppointments);

    // Set up interval for date change check
    setInterval(checkDateChange, 3600000);
}

// Initialize the app when the page loads
window.onload = initializeApp;