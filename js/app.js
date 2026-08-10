document.addEventListener("DOMContentLoaded", initialise);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    console.log("=================================");
    console.log("GateKeeper Started");
    console.log("=================================");

    await loadEvents();

    // =====================================
    // EVENT DROPDOWN
    // =====================================

    const eventSelect =
        document.getElementById("eventSelect");

    if (eventSelect) {

        eventSelect.addEventListener(
            "change",
            eventChanged
        );

    }

    // =====================================
    // NAVIGATION
    // =====================================

    setupNavigation();

}


// =====================================
// LOAD EVENTS
// =====================================

async function loadEvents() {

    const ddl =
        document.getElementById("eventSelect");

    if (!ddl) {

        console.error(
            "eventSelect element not found."
        );

        return;

    }


    ddl.innerHTML =
        "<option value=''>Loading events...</option>";


    try {

        const events =
            await GateKeeperAPI.getEvents();


        console.log(
            "Events returned from API:",
            events
        );


        // =====================================
        // NO EVENTS
        // =====================================

        if (!events || events.length === 0) {

            ddl.innerHTML =
                "<option value=''>No Events Available</option>";

            localStorage.removeItem(
                "CurrentEventId"
            );

            localStorage.removeItem(
                "CurrentEventName"
            );

            return;

        }


        // =====================================
        // CREATE DROPDOWN
        // =====================================

        ddl.innerHTML =
            "<option value=''>Select Event...</option>";


        events.forEach(event => {

            const option =
                document.createElement("option");


            // Always store Event ID as a string
            option.value =
                String(event.Id);


            option.textContent =
                event.Name;


            ddl.appendChild(option);


            console.log(
                "Event loaded:",
                {
                    id: event.Id,
                    name: event.Name
                }
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


        if (!savedEventId) {

            console.log(
                "No previously selected event."
            );

            return;

        }


        // =====================================
        // FIND SAVED EVENT
        // =====================================

        const matchingEvent =
            events.find(event =>
                String(event.Id) ===
                String(savedEventId)
            );


        if (matchingEvent) {

            // Restore dropdown
            ddl.value =
                String(matchingEvent.Id);


            // Re-save both values from the
            // actual event returned by the API

            localStorage.setItem(
                "CurrentEventId",
                String(matchingEvent.Id)
            );


            localStorage.setItem(
                "CurrentEventName",
                matchingEvent.Name
            );


            console.log(
                "================================="
            );

            console.log(
                "RESTORED EVENT"
            );

            console.log(
                "Event ID:",
                matchingEvent.Id
            );

            console.log(
                "Event Name:",
                matchingEvent.Name
            );

            console.log(
                "Stored Event ID:",
                localStorage.getItem(
                    "CurrentEventId"
                )
            );

            console.log(
                "Stored Event Name:",
                localStorage.getItem(
                    "CurrentEventName"
                )
            );

            console.log(
                "================================="
            );

        }
        else {

            console.warn(
                "Saved event no longer exists:",
                savedEventId
            );


            localStorage.removeItem(
                "CurrentEventId"
            );


            localStorage.removeItem(
                "CurrentEventName"
            );


            ddl.value = "";

        }

    }
    catch (err) {

        console.error(
            "Failed to load events:",
            err
        );


        ddl.innerHTML =
            "<option value=''>Unable to load events</option>";

    }

}


// =====================================
// EVENT CHANGED
// =====================================

function eventChanged() {

    const ddl =
        document.getElementById("eventSelect");


    if (!ddl) {

        console.error(
            "eventSelect element not found."
        );

        return;

    }


    const eventId =
        ddl.value;


    // =====================================
    // NO EVENT SELECTED
    // =====================================

    if (!eventId) {

        localStorage.removeItem(
            "CurrentEventId"
        );


        localStorage.removeItem(
            "CurrentEventName"
        );


        console.log(
            "Event selection cleared."
        );


        return;

    }


    const selectedOption =
        ddl.options[
            ddl.selectedIndex
        ];


    const eventName =
        selectedOption.textContent;


    // =====================================
    // SAVE EVENT
    // =====================================

    localStorage.setItem(
        "CurrentEventId",
        String(eventId)
    );


    localStorage.setItem(
        "CurrentEventName",
        eventName
    );


    // =====================================
    // VERIFY STORAGE
    // =====================================

    const storedEventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    const storedEventName =
        localStorage.getItem(
            "CurrentEventName"
        );


    console.log(
        "================================="
    );

    console.log(
        "CURRENT EVENT CHANGED"
    );

    console.log(
        "Selected Event ID:",
        eventId
    );

    console.log(
        "Selected Event Name:",
        eventName
    );

    console.log(
        "localStorage Event ID:",
        storedEventId
    );

    console.log(
        "localStorage Event Name:",
        storedEventName
    );

    console.log(
        "================================="
    );

}


// =====================================
// NAVIGATION SETUP
// =====================================

function setupNavigation() {


    // =====================================
    // CHECK IN
    // =====================================

    const btnCheckIn =
        document.getElementById(
            "btnCheckIn"
        );


    if (btnCheckIn) {

        btnCheckIn.addEventListener(
            "click",
            () => {

                const eventId =
                    localStorage.getItem(
                        "CurrentEventId"
                    );


                const eventName =
                    localStorage.getItem(
                        "CurrentEventName"
                    );


                console.log(
                    "Check In clicked."
                );


                console.log(
                    "Current Event:",
                    eventName
                );


                console.log(
                    "Current Event ID:",
                    eventId
                );


                if (!eventId) {

                    alert(
                        "Please select an event first."
                    );

                    return;

                }


                window.location.href =
                    "checkin.html";

            }
        );

    }


    // =====================================
    // CHECK OUT
    // =====================================

    const btnCheckOut =
        document.getElementById(
            "btnCheckOut"
        );


    if (btnCheckOut) {

        btnCheckOut.addEventListener(
            "click",
            () => {

                const eventId =
                    localStorage.getItem(
                        "CurrentEventId"
                    );


                const eventName =
                    localStorage.getItem(
                        "CurrentEventName"
                    );


                console.log(
                    "Check Out clicked."
                );


                console.log(
                    "Current Event:",
                    eventName
                );


                console.log(
                    "Current Event ID:",
                    eventId
                );


                if (!eventId) {

                    alert(
                        "Please select an event first."
                    );

                    return;

                }


                window.location.href =
                    "checkout.html";

            }
        );

    }


    // =====================================
    // STATUS
    // =====================================

    const btnStatus =
        document.getElementById(
            "btnStatus"
        );


    if (btnStatus) {

        btnStatus.addEventListener(
            "click",
            () => {

                alert(
                    "Coming next..."
                );

            }
        );

    }


    // =====================================
    // SETTINGS
    // =====================================

    const btnSettings =
        document.getElementById(
            "btnSettings"
        );


    if (btnSettings) {

        btnSettings.addEventListener(
            "click",
            () => {

                alert(
                    "Coming next..."
                );

            }
        );

    }

}