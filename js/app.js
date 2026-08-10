document.addEventListener("DOMContentLoaded", initialise);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    console.log("=================================");
    console.log("GateKeeper Started");
    console.log("=================================");

    await loadEvents();

    const eventSelect =
        document.getElementById("eventSelect");

    if (eventSelect) {

        eventSelect.addEventListener(
            "change",
            eventChanged
        );

    }

}


// =====================================
// LOAD EVENTS
// =====================================

async function loadEvents() {

    const ddl =
        document.getElementById("eventSelect");

    ddl.innerHTML =
        "<option>Loading events...</option>";


    const events =
        await GateKeeperAPI.getEvents();


    if (!events || events.length === 0) {

        ddl.innerHTML =
            "<option>No Events Available</option>";

        return;

    }


    ddl.innerHTML =
        "<option value=''>Select Event...</option>";


    events.forEach(event => {

        const option =
            document.createElement("option");


        option.value =
            event.Id;


        option.textContent =
            event.Name;


        ddl.appendChild(option);


        console.log(
            "Event loaded:",
            event.Id,
            event.Name
        );

    });


    // =====================================
    // RESTORE SAVED EVENT
    // =====================================

    const savedEventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    const savedEventName =
        localStorage.getItem(
            "CurrentEventName"
        );


    console.log(
        "Saved Event ID:",
        savedEventId
    );


    console.log(
        "Saved Event Name:",
        savedEventName
    );


    if (savedEventId) {

        ddl.value =
            savedEventId;


        // Check that the saved event actually
        // exists in the current event list

        if (ddl.value === savedEventId) {

            console.log(
                "Restored event:",
                savedEventId,
                ddl.options[ddl.selectedIndex].text
            );

        }
        else {

            console.warn(
                "Saved event no longer exists."
            );

            localStorage.removeItem(
                "CurrentEventId"
            );

            localStorage.removeItem(
                "CurrentEventName"
            );

        }

    }

}


// =====================================
// EVENT CHANGED
// =====================================

function eventChanged() {

    const ddl =
        document.getElementById("eventSelect");


    const eventId =
        ddl.value;


    // =====================================
    // No event selected
    // =====================================

    if (!eventId) {

        localStorage.removeItem(
            "CurrentEventId"
        );

        localStorage.removeItem(
            "CurrentEventName"
        );

        console.log(
            "Event selection cleared"
        );

        return;

    }


    const eventName =
        ddl.options[
            ddl.selectedIndex
        ].text;


    // =====================================
    // SAVE CURRENT EVENT
    // =====================================

    localStorage.setItem(
        "CurrentEventId",
        eventId
    );


    localStorage.setItem(
        "CurrentEventName",
        eventName
    );


    // =====================================
    // DEBUG
    // =====================================

    console.log(
        "================================="
    );

    console.log(
        "CURRENT EVENT CHANGED"
    );

    console.log(
        "Event ID:",
        eventId
    );

    console.log(
        "Event Name:",
        eventName
    );

    console.log(
        "localStorage Event ID:",
        localStorage.getItem(
            "CurrentEventId"
        )
    );

    console.log(
        "localStorage Event Name:",
        localStorage.getItem(
            "CurrentEventName"
        )
    );

    console.log(
        "================================="
    );

}


// =====================================
// CHECK IN
// =====================================

document
    .getElementById("btnCheckIn")
    .addEventListener("click", () => {

        const eventId =
            localStorage.getItem(
                "CurrentEventId"
            );


        if (!eventId) {

            alert(
                "Please select an event first."
            );

            return;

        }


        console.log(
            "Opening Check In for event:",
            eventId
        );


        window.location.href =
            "checkin.html";

    });


// =====================================
// CHECK OUT
// =====================================

document
    .getElementById("btnCheckOut")
    .addEventListener("click", () => {

        const eventId =
            localStorage.getItem(
                "CurrentEventId"
            );


        if (!eventId) {

            alert(
                "Please select an event first."
            );

            return;

        }


        console.log(
            "Opening Check Out for event:",
            eventId
        );


        window.location.href =
            "checkout.html";

    });


// =====================================
// STATUS
// =====================================

document
    .getElementById("btnStatus")
    .addEventListener("click", () => {

        alert(
            "Coming next..."
        );

    });


// =====================================
// SETTINGS
// =====================================

document
    .getElementById("btnSettings")
    .addEventListener("click", () => {

        alert(
            "Coming next..."
        );

    });