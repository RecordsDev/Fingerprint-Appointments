const slots = [
    "9:00 AM", "10:00 AM", "11:00 AM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

function getDateString(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function formatDateForComparison(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function standardizeTimeFormat(timeString) {
    timeString = timeString.toUpperCase().replace(/\./g, "");
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    if (period === "PM" && hours !== 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
}

function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.backgroundColor = "#ff9999";
    errorDiv.style.padding = "10px";
    errorDiv.style.margin = "10px 0";
    errorDiv.style.borderRadius = "5px";
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}