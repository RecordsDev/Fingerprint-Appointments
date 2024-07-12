const slots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
];
const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
let appointmentData = [];
let reservedDates = [];

// Sample appointment data
/*
const sampleAppointments = [{
        date: "06/19/2024",
        time: "9:00 AM",
        name: "John Doe",
        phone: "555-1234",
        completed: true,
        fingerprintCardOnly: false,
    },
    {
        date: "06/22/2024",
        time: "11:00 AM",
        name: "Jane Smith",
        phone: "555-5678",
        completed: false,
        fingerprintCardOnly: true,
    },
    {
        date: "06/23/2024",
        time: "2:00 PM",
        name: "Bob Johnson",
        phone: "555-9876",
        completed: false,
        fingerprintCardOnly: false,
    },
    {
        date: "06/24/2024",
        time: "4:00 PM",
        name: "Alice Brown",
        phone: "555-4321",
        completed: true,
        fingerprintCardOnly: true,
    },
    {
        date: "06/25/2024",
        time: "10:00 AM",
        name: "Charlie Wilson",
        phone: "555-8765",
        completed: false,
        fingerprintCardOnly: false,
    },
];
*/

function fetchAppointmentData() {
    return fetch("http://fpas.atwebpages.com/get_appointments.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((text) => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("Server response was not valid JSON:", text);
                throw new Error("The server response was not valid JSON");
            }
        })
        .then((data) => {
            if (data.error) {
                throw new Error(data.error);
            }
            appointmentData = data.map((appointment) => ({
                date: appointment.date, // This should already be in YYYY-MM-DD format
                time: standardizeTimeFormat(appointment.time),
                name: appointment.name,
                phone: appointment.phone,
                completed: appointment.completed === "1",
                fingerprintCardOnly: appointment.fingerprint_card_only === "1",
            }));
            console.log("Fetched appointment data:", appointmentData); // Debug log
            return appointmentData;
        })
        .catch((error) => {
            console.error("Error fetching appointment data:", error);
            showError("Failed to fetch appointment data: " + error.message);
            return [];
        });
}

function loadAppointmentData() {
    return fetchAppointmentData();
}

function getDateString(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function createDaySchedule(day, date) {
    const dateString = getDateString(date);
    const formattedDateString = formatDateForComparison(dateString);
    const isReserved = reservedDates.includes(dateString);
    
    console.log(`Creating schedule for ${formattedDateString}`); // Debug log

    let daySchedule = `
    <div class="day-schedule ${isReserved ? 'reserved' : ''}" id="day-${dateString.replace(/\//g, "-")}-${day}">
        <h2>${day} - ${dateString}</h2>
        <label class="reserve-checkbox">
            <input type="checkbox" onchange="toggleReserve('${dateString}')" ${isReserved ? 'checked' : ''}>
            Reserve
        </label>
        <table class="schedule">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Name/Phone</th>
                    <th>Completed</th>
                    <th>Fingerprint Card Only</th>
                </tr>
            </thead>
            <tbody>
    `;

    slots.forEach((slot, index) => {
        const standardizedSlot = standardizeTimeFormat(slot);
        const appointment = appointmentData.find(a => a.date === formattedDateString && a.time === standardizedSlot);
        
        console.log(`Checking appointment for ${formattedDateString} at ${standardizedSlot}:`, appointment); // Debug log

        const name = appointment ? appointment.name : '';
        const phone = appointment ? appointment.phone : '';
        const completed = appointment ? appointment.completed : false;
        const fingerprintCardOnly = appointment ? appointment.fingerprintCardOnly : false;

        daySchedule += `
            <tr class="${completed ? 'complete' : ''}">
                <td class="time-slot">${slot}</td>
                <td class="slot">
                    <div class="appointment" data-slot-index="${index}">
                        <input type="text" name="name" placeholder="Name" value="${name}" ${completed ? 'readonly' : ''}>
                        <input type="text" name="phone" placeholder="Phone Number" value="${phone}" ${completed ? 'readonly' : ''}>
                    </div>
                </td>
                <td>
                    <div class="checkbox-container">
                        <input type="checkbox" class="checkbox" onclick="markComplete(event)" ${completed ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <div class="checkbox-container">
                        <input type="checkbox" class="checkbox" name="fingerprint_card_only" onclick="toggleFingerprintCardOnly(event)" 
                            ${fingerprintCardOnly ? 'checked' : ''} ${completed ? 'disabled' : ''}>
                    </div>
                </td>
            </tr>
        `;
    });

    daySchedule += `
            </tbody>
        </table>
    </div>
    `;

    return daySchedule;
}

function formatDateForComparison(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function standardizeTimeFormat(timeString) {
    // Convert to uppercase and remove any periods
    timeString = timeString.toUpperCase().replace(/\./g, "");

    // Parse the time
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    // Convert to 24-hour format
    hours = parseInt(hours);
    if (period === "PM" && hours !== 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }

    // Return standardized format
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
}

function populateMonthSchedule(startDate) {
    const monthScheduleDiv = document.getElementById("month-schedule");
    monthScheduleDiv.innerHTML = "";
    let currentDate = new Date(startDate);
    for (let i = 0; i < 30; i++) {
        let date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        let day = days[date.getDay()];
        monthScheduleDiv.innerHTML += createDaySchedule(day, date);
    }
}

function initializeApp() {
    fetchAppointmentData().then(() => {
        populateMonthSchedule(new Date());
    });
}

function saveAppointments() {
    const appointments = [];
    const daySchedules = document.querySelectorAll(".day-schedule");

    daySchedules.forEach((daySchedule) => {
        const date = daySchedule
            .querySelector("h2")
            .textContent.split(" - ")[1];
        const rows = daySchedule.querySelectorAll("tbody tr");

        rows.forEach((row) => {
            const time = row.querySelector(".time-slot").textContent;
            const nameInput = row.querySelector('input[placeholder="Name"]');
            const phoneInput = row.querySelector(
                'input[placeholder="Phone Number"]'
            );
            const completedCheckbox = row.querySelector(
                'input[onclick="markComplete(event)"]'
            );
            const fingerprintCardOnlyCheckbox = row.querySelector(
                'input[name="fingerprint_card_only"]'
            );

            // Include all appointments, even if name and phone are empty
            appointments.push({
                date: date,
                time: time,
                name: nameInput.value,
                phone: phoneInput.value,
                completed: completedCheckbox.checked ? 1 : 0,
                fingerprint_card_only: fingerprintCardOnlyCheckbox.checked ?
                    1 :
                    0,
            });
        });
    });

    fetch(
            "http://fpas.atwebpages.com/save_appointments.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(appointments),
            }
        )
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                alert("Appointments saved successfully!");
            } else {
                console.error("Server responded with an error:", data.error);
                throw new Error(data.error || "Failed to save appointments");
            }
        })
        .catch((error) => {
            console.error("Error saving appointments:", error);
            console.error("Error details:", error.stack);
            alert(
                "Failed to save appointments. Please check the console for more details."
            );
        });
}

// Add event listener to the save button
document
    .getElementById("save-button")
    .addEventListener("click", saveAppointments);

function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.backgroundColor = "#ff9999";
    errorDiv.style.padding = "10px";
    errorDiv.style.margin = "10px 0";
    errorDiv.style.borderRadius = "5px";
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}

function checkDateChange() {
    let currentDate = new Date();
    let currentDateString = getDateString(currentDate);

    let firstScheduleDate = document
        .querySelector(".day-schedule h2")
        .textContent.split(" - ")[1];
    if (currentDateString !== firstScheduleDate) {
        populateMonthSchedule(currentDate);
    }
}

setInterval(checkDateChange, 3600000);

function markComplete(event) {
    const row = event.target.closest("tr");
    const isCompleted = event.target.checked;
    row.classList.toggle("complete", isCompleted);
    const inputs = row.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
        input.readOnly = isCompleted;
    });

    // Disable or enable the "Fingerprint Card Only" checkbox
    const fingerprintCardOnlyCheckbox = row.querySelector(
        'input[name="fingerprint_card_only"]'
    );
    fingerprintCardOnlyCheckbox.disabled = isCompleted;
}

function toggleFingerprintCardOnly(event) {
    // This function can remain empty or you can add any additional logic here
}

function toggleReserve(dateString) {
    const daySchedule = document.getElementById(
        `day-${dateString.replace(/\//g, "-")}-${
            days[new Date(dateString).getDay()]
          }`
    );
    if (daySchedule) {
        daySchedule.classList.toggle("reserved");
        const isReserved = daySchedule.classList.contains("reserved");

        if (isReserved) {
            reservedDates.push(dateString);
        } else {
            reservedDates = reservedDates.filter((date) => date !== dateString);
        }
    }
}

// Utility functions

function getDateString(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getDate()
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
}

/*
function standardizeTimeFormat(timeString) {
    if (!timeString) return null;

    // Convert to uppercase and remove any periods
    timeString = timeString.toUpperCase().replace(/\./g, "");

    // Parse the time
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    // Convert to 24-hour format
    hours = parseInt(hours);
    if (period === "PM" && hours !== 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }

    // Return standardized format
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
}
*/

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



function getSelectedDate() {
    return picker.toString('YYYY-MM-DD');
}

// Initialize the app when the page loads
window.onload = initializeApp;