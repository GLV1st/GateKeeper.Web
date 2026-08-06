document.addEventListener("DOMContentLoaded", initialise);

async function initialise() {

    console.log("GateKeeper Started");

    await loadEvents();

    document.getElementById("eventSelect").addEventListener("change", eventChanged);

}

async function loadEvents() {

    const ddl = document.getElementById("eventSelect");

    ddl.innerHTML = "";

    const events = await GateKeeperAPI.getEvents();

    if (!events || events.length === 0) {

        ddl.innerHTML = "<option>No Events Available</option>";
        return;

    }

    ddl.innerHTML = "<option value=''>Select Event...</option>";

    events.forEach(event => {

        const option = document.createElement("option");

        option.value = event.Id;
        option.textContent = event.Name;

        ddl.appendChild(option);

    });

    // Restore previously selected event
    const savedEventId = localStorage.getItem("CurrentEventId");

    if (savedEventId) {

        ddl.value = savedEventId;

    }

}

function eventChanged() {

    const ddl = document.getElementById("eventSelect");

    if (ddl.value === "")
        return;

    localStorage.setItem("CurrentEventId", ddl.value);
    localStorage.setItem("CurrentEventName", ddl.options[ddl.selectedIndex].text);

    console.log("Current Event:", ddl.value);

}