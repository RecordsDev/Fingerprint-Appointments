// Global variable to track the currently editing appointment
let currentlyEditingAppointment = null;

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
                date: appointment.date,
                time: standardizeTimeFormat(appointment.time),
                name: appointment.name,
                phone: appointment.phone,
                completed: appointment.completed === "1",
                fingerprintCardOnly: appointment.fingerprint_card_only === "1",
            }));
            console.log("Fetched appointment data:", appointmentData);
            return appointmentData;
        })
        .catch((error) => {
            console.error("Error fetching appointment data:", error);
            showError("Failed to fetch appointment data: " + error.message);
            return [];
        });
}

function saveAppointments() {
    const appointments = [];
    const daySchedules = document.querySelectorAll(".day-schedule");

    daySchedules.forEach((daySchedule) => {
        const date = daySchedule.querySelector("h2").textContent.split(" - ")[1];
        const rows = daySchedule.querySelectorAll("tbody tr");

        rows.forEach((row) => {
            const time = row.querySelector(".time-slot").textContent;
            const nameInput = row.querySelector('input[placeholder="Name"]');
            const phoneInput = row.querySelector('input[placeholder="Phone Number"]');
            const completedCheckbox = row.querySelector('input[onclick="markComplete(event)"]');
            const fingerprintCardOnlyCheckbox = row.querySelector('input[name="fingerprint_card_only"]');

            appointments.push({
                date: date,
                time: time,
                name: nameInput.value,
                phone: phoneInput.value,
                completed: completedCheckbox.checked ? 1 : 0,
                fingerprint_card_only: fingerprintCardOnlyCheckbox.checked ? 1 : 0,
            });
        });
    });

    fetch("http://fpas.atwebpages.com/save_appointments.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(appointments),
    })
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
        alert("Failed to save appointments. Please check the console for more details.");
    });
}

function enterEditMode(appointmentRow) {
    if (currentlyEditingAppointment) {
        exitEditMode();
    }

    currentlyEditingAppointment = appointmentRow;
    
    appointmentRow.querySelectorAll('input[type="text"]').forEach(input => {
        input.removeAttribute('readonly');
    });

    appointmentRow.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.disabled = false;
    });

    const button = appointmentRow.querySelector('.manage-appointment');
    button.innerHTML = '<span>Save</span><span>Changes</span>';

    appointmentRow.classList.add('editing');
}

function exitEditMode() {
    if (!currentlyEditingAppointment) return;

    currentlyEditingAppointment.querySelectorAll('input[type="text"]').forEach(input => {
        input.setAttribute('readonly', true);
    });

    currentlyEditingAppointment.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.disabled = true;
    });

    const button = currentlyEditingAppointment.querySelector('.manage-appointment');
    button.innerHTML = '<span>Manage</span><span>Appointment</span>';

    currentlyEditingAppointment.classList.remove('editing');

    currentlyEditingAppointment = null;
}

function saveAppointment(appointmentRow) {
    console.log('Saving appointment:', appointmentRow);
    // TODO: Implement actual saving logic
}

// Event listener for manage appointment buttons
document.addEventListener('click', function(e) {
    if (e.target && e.target.closest('.manage-appointment')) {
        const appointmentRow = e.target.closest('.appointment-row');
        
        if (currentlyEditingAppointment === appointmentRow) {
            saveAppointment(appointmentRow);
            exitEditMode();
        } else {
            enterEditMode(appointmentRow);
        }
    } else if (currentlyEditingAppointment && !e.target.closest('.appointment-row')) {
        exitEditMode();
    }
});

function markComplete(event) {
    const row = event.target.closest("tr");
    const isCompleted = event.target.checked;
    row.classList.toggle("complete", isCompleted);
    const inputs = row.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
        input.readOnly = isCompleted;
    });

    const fingerprintCardOnlyCheckbox = row.querySelector(
        'input[name="fingerprint_card_only"]'
    );
    fingerprintCardOnlyCheckbox.disabled = isCompleted;
}

function toggleFingerprintCardOnly(event) {
    // This function can remain empty or you can add any additional logic here
}