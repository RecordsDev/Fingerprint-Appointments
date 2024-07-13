function createDaySchedule(day, date) {
    const dateString = getDateString(date);
    const formattedDateString = formatDateForComparison(dateString);
    const isReserved = reservedDates.includes(dateString);
    
    let daySchedule = `
    <div class="day-schedule ${isReserved ? 'reserved' : ''}" id="day-${dateString.replace(/\//g, "-")}-${day}">
        <h2>${day} - ${dateString}</h2>
        <label class="reserve-checkbox">
            <input type="checkbox" class="checkbox" onchange="toggleReserve('${dateString}')" ${isReserved ? 'checked' : ''}>
            Reserve
        </label>
        <table class="schedule">
            <thead>
                <tr>
                    <th class="time-column">Time</th>
                    <th class="name-phone-column">Name/Phone</th>
                    <th>Completed</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    slots.forEach((slot, index) => {
        const appointment = appointmentData.find(a => a.date === formattedDateString && a.time === standardizeTimeFormat(slot));
        const name = appointment ? appointment.name : '';
        const phone = appointment ? appointment.phone : '';
        const completed = appointment ? appointment.completed : false;

        daySchedule += `
            <tr class="appointment-row ${completed ? 'complete' : ''}" data-time="${slot}" data-date="${formattedDateString}">
                <td class="time-slot">
                    <span class="time-text">${slot}</span>
                </td>
                <td class="slot">
                    <div class="appointment" data-slot-index="${index}">
                        <input type="text" name="name" placeholder="Name" value="${name}" readonly>
                        <input type="text" name="phone" placeholder="Phone Number" value="${phone}" readonly>
                    </div>
                </td>
                <td class="status">
                    <input type="checkbox" class="checkbox completed-checkbox" ${completed ? 'checked' : ''} disabled>
                </td>
                <td class="actions">
                    <button class="save-btn" title="Confirm"><i class="fas fa-check"></i></button>
                    <button class="cancel-btn" title="Cancel"><i class="fas fa-times"></i></button>
                    <button class="delete-btn" title="Delete Appointment"><i class="fas fa-trash-alt"></i></button>
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