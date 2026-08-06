document.addEventListener("DOMContentLoaded", () => {

    const eventName = localStorage.getItem("CurrentEventName");

    document.getElementById("eventName").textContent =
        eventName || "No Event Selected";

});