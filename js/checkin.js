// =====================================
// GateKeeper - Check In
// =====================================

document.addEventListener("DOMContentLoaded", initialise);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    console.log("=================================");
    console.log("GateKeeper Check In");
    console.log("=================================");

    const eventId =
        localStorage.getItem("CurrentEventId");

    const eventName =
        localStorage.getItem("CurrentEventName");


    // =================================
    // CHECK EVENT
    // =================================

    if (!eventId) {

        console.error("No current event selected.");

        document.getElementById("eventName").textContent =
            "No Event Selected";

        return;

    }


    console.log("Event ID:", eventId);
    console.log("Event Name:", eventName);


    // =================================
    // DISPLAY EVENT
    // =================================

    document.getElementById("eventName").textContent =
        eventName || "Current Event";


    // =================================
    // LOAD INITIAL STATS
    // =================================

    await updateStats();


    // =================================
    // START SCANNER
    // =================================

    try {

        await Scanner.start(
            handleScan
        );

        setScanStatus(
            "🟢 READY TO SCAN",
            "scan-ready"
        );

    }
    catch (err) {

        console.error(
            "Camera failed:",
            err
        );

        setScanStatus(
            "🔴 CAMERA FAILED",
            "scan-error"
        );

    }

}


// =====================================
// HANDLE SCAN
// =====================================

async function handleScan(ticketNumber) {

    console.log("=================================");
    console.log("TICKET SCANNED");
    console.log("Ticket:", ticketNumber);
    console.log("=================================");


    const eventId =
        localStorage.getItem("CurrentEventId");


    if (!eventId) {

        alert("No event selected.");

        return;

    }


    setScanStatus(
        "🔵 CHECKING TICKET...",
        "scan-processing"
    );


    try {

        const result =
            await GateKeeperAPI.checkIn(
                ticketNumber,
                eventId
            );


        console.log(
            "Check In result:",
            result
        );


        // =================================
        // DISPLAY TICKET
        // =================================

        displayTicket(result);


        // =================================
        // RESULT
        // =================================

        if (result.Status === "SUCCESS") {

            setScanStatus(
                "🟢 CHECKED IN",
                "scan-success"
            );

        }
        else if (
            result.Status === "ALREADY_CHECKED_IN"
        ) {

            setScanStatus(
                "🟠 ALREADY CHECKED IN",
                "scan-warning"
            );

        }
        else if (
            result.Status === "CANCELLED"
        ) {

            setScanStatus(
                "🔴 TICKET CANCELLED",
                "scan-error"
            );

        }
        else if (
            result.Status === "NOT_FOUND"
        ) {

            setScanStatus(
                "🔴 TICKET NOT FOUND",
                "scan-error"
            );

        }
        else {

            setScanStatus(
                "🔴 " +
                (result.Message || "CHECK IN FAILED"),
                "scan-error"
            );

        }


        // =================================
        // IMPORTANT
        // REFRESH COUNTERS
        // =================================

        await updateStats();

    }
    catch (err) {

        console.error(
            "Check In error:",
            err
        );

        setScanStatus(
            "🔴 CHECK IN FAILED",
            "scan-error"
        );

    }

}


// =====================================
// UPDATE EVENT STATISTICS
// =====================================

async function updateStats() {

    const eventId =
        localStorage.getItem("CurrentEventId");


    if (!eventId) {

        console.warn(
            "Cannot update stats - no event selected."
        );

        return;

    }


    console.log(
        "Loading statistics for event:",
        eventId
    );


    try {

        const stats =
            await GateKeeperAPI.getEventStats(
                eventId
            );


        console.log(
            "Event statistics:",
            stats
        );


        // =================================
        // CHECKED IN
        // =================================

        const checkedIn =
            document.getElementById(
                "checkedInCount"
            );


        if (checkedIn) {

            checkedIn.textContent =
                stats.CheckedIn ?? 0;

        }


        // =================================
        // ON SITE
        // =================================

        const onSite =
            document.getElementById(
                "onSiteCount"
            );


        if (onSite) {

            onSite.textContent =
                stats.OnSite ?? 0;

        }


    }
    catch (err) {

        console.error(
            "Unable to update statistics:",
            err
        );

    }

}


// =====================================
// DISPLAY LAST TICKET
// =====================================

function displayTicket(result) {

    const ticketNumber =
        document.getElementById(
            "ticketNumber"
        );

    const ticketHolder =
        document.getElementById(
            "ticketHolder"
        );

    const ticketType =
        document.getElementById(
            "ticketType"
        );

    const ticketTime =
        document.getElementById(
            "ticketTime"
        );


    if (ticketNumber) {

        ticketNumber.textContent =
            result.TicketNumber || "-";

    }


    if (ticketHolder) {

        ticketHolder.textContent =
            result.CustomerName || "-";

    }


    if (ticketType) {

        ticketType.textContent =
            result.TicketType || "-";

    }


    if (ticketTime) {

        ticketTime.textContent =
            new Date().toLocaleTimeString();

    }

}


// =====================================
// SCAN STATUS
// =====================================

function setScanStatus(
    message,
    className
) {

    const status =
        document.getElementById(
            "scanStatus"
        );


    if (!status)
        return;


    status.textContent =
        message;


    status.className =
        className;

}