function createDaySchedule(day, date) {
    const dateString = getDateString(date);
    const formattedDateString = formatDateForComparison(dateString);
    const isReserved = reservedDates.includes(dateString);
    
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
                    <th class="time-column">Time</th>
                    <th class="name-phone-column">Name/Phone</th>
                    <th>Completed</th>
                    <th>Fingerprint Card Only</th>
                </tr>
            </thead>
            <tbody>
    `;

    slots.forEach((slot, index) => {
        const appointment = appointmentData.find(a => a.date === formattedDateString && a.time === standardizeTimeFormat(slot));
        const name = appointment ? appointment.name : '';
        const phone = appointment ? appointment.phone : '';
        const completed = appointment ? appointment.completed : false;
        const fingerprintCardOnly = appointment ? appointment.fingerprintCardOnly : false;

        daySchedule += `
            <tr class="appointment-row">
                <td class="time-slot">
                    <span class="time-text">${slot}</span>
                    <button class="manage-appointment">
                        <span>Manage</span>
                        <span>Appointment</span>
                    </button>
                </td>
                <td class="slot">
                    <div class="appointment" data-slot-index="${index}">
                        <input type="text" name="name" placeholder="Name" value="${name}" readonly>
                        <input type="text" name="phone" placeholder="Phone Number" value="${phone}" readonly>
                    </div>
                </td>
                <td>
                    <div class="checkbox-container">
                        <input type="checkbox" class="checkbox" onclick="markComplete(event)" ${completed ? 'checked' : ''} disabled>
                    </div>
                </td>
                <td>
                    <div class="checkbox-container">
                        <input type="checkbox" class="checkbox" name="fingerprint_card_only" onclick="toggleFingerprintCardOnly(event)" 
                            ${fingerprintCardOnly ? 'checked' : ''} ${completed ? 'disabled' : ''} disabled>
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