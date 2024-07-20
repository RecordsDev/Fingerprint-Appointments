// Global variable to track the currently editing appointment
let currentlyEditingAppointment = null;

const fetchAppointmentData = async () => {
    try {
        // const response = await fetch("https://towlog.000webhostapp.com/appointments/get_appointments.php");
        const response = await fetch("http://localhost/FingerprintAppointments/src/php/get_appointments.php");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        appointmentData = data.map(appointment => ({
            date: appointment.date,
            time: standardizeTimeFormat(appointment.time),
            name: appointment.name,
            phone: appointment.phone,
            completed: appointment.completed === "1",
            fingerprintCardOnly: appointment.fingerprint_card_only === "1",
        }));
        
        console.log("Fetched appointment data:", appointmentData);
        return appointmentData;
    } catch (error) {
        console.error("Error fetching appointment data:", error);
        showError("Failed to fetch appointment data: " + error.message);
        return [];
    }
};

const saveAppointment = async (appointmentData) => {
    try {
        // const response = await fetch("https://towlog.000webhostapp.com/appointments/save_appointments.php", {
        const response = await fetch("http://localhost/FingerprintAppointments/src/php/save_appointments.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Failed to save appointment");
        
        alert("Appointment saved successfully!");
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Failed to save appointment. Please check the console for more details.");
    }
};

const enterEditMode = (appointmentRow) => {
    if (currentlyEditingAppointment) exitEditMode();

    currentlyEditingAppointment = appointmentRow;
    
    appointmentRow.querySelectorAll('input[type="text"]').forEach(input => input.removeAttribute('readonly'));
    appointmentRow.querySelector('.completed-checkbox').disabled = false;

    appointmentRow.querySelectorAll('.actions button').forEach(button => button.style.display = 'inline-block');

    appointmentRow.classList.add('editing');
};

const exitEditMode = () => {
    if (!currentlyEditingAppointment) return;

    currentlyEditingAppointment.querySelectorAll('input[type="text"]').forEach(input => input.setAttribute('readonly', true));
    currentlyEditingAppointment.querySelector('.completed-checkbox').disabled = true;

    currentlyEditingAppointment.querySelectorAll('.actions button').forEach(button => button.style.display = 'none');

    currentlyEditingAppointment.classList.remove('editing');
    currentlyEditingAppointment = null;
};

const handleAppointmentClick = (e) => {
    const appointmentRow = e.target.closest('.appointment-row');
    if (!appointmentRow) return;

    if (appointmentRow.classList.contains('editing')) {
        if (e.target.closest('.save-btn')) {
            saveChanges(appointmentRow);
        } else if (e.target.closest('.cancel-btn')) {
            exitEditMode();
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('Are you sure you want to delete this appointment?')) {
                deleteAppointment(appointmentRow);
            }
        }
    } else {
        enterEditMode(appointmentRow);
    }
};

const saveChanges = async (appointmentRow) => {
    const date = appointmentRow.dataset.date;
    const time = appointmentRow.dataset.time;
    const name = appointmentRow.querySelector('input[name="name"]').value;
    const phone = appointmentRow.querySelector('input[name="phone"]').value;
    const completed = appointmentRow.querySelector('.completed-checkbox').checked;

    const updatedAppointment = {
        date: date,
        time: time,
        name: name,
        phone: phone,
        completed: completed ? 1 : 0,
        fingerprint_card_only: 0  // We're not handling this for now, as per your earlier comment
    };

    try {
        // const response = await fetch("https://towlog.000webhostapp.com/appointments/save_appointments.php", {
        const response = await fetch("http://localhost/FingerprintAppointments/src/php/save_appointments.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedAppointment),
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Failed to save appointment");
        
        alert(data.message);  // Show success message
        
        // Update the UI to reflect the changes
        appointmentRow.querySelector('input[name="name"]').value = name;
        appointmentRow.querySelector('input[name="phone"]').value = phone;
        appointmentRow.querySelector('.completed-checkbox').checked = completed;
        appointmentRow.classList.toggle('complete', completed);

        exitEditMode();
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Failed to save appointment. Please try again.");
    }
};

const markComplete = (event) => {
    const row = event.target.closest("tr");
    const isCompleted = event.target.checked;
    row.classList.toggle("complete", isCompleted);
    row.querySelectorAll('input[type="text"]').forEach(input => input.readOnly = isCompleted);
    row.querySelector('input[name="fingerprint_card_only"]').disabled = isCompleted;
};

// Event listener for appointment interactions
document.addEventListener('click', handleAppointmentClick);